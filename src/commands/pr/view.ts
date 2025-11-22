import pc from 'picocolors';
import { getBitbucketClient } from '../../core/client';
import { getWorkspace } from '../../core/config';
import { getRemoteInfo } from '../../core/git';
import { handleError } from '../../utils/errors';
import { displaySection, displayKeyValue, formatDateTime } from '../../utils/display';
import { getStateColor, badge } from '../../utils/colors';

interface ViewOptions {
  workspace?: string;
  repo?: string;
}

export async function viewPR(prId: string, options: ViewOptions): Promise<void> {
  try {
    let workspace = options.workspace || getWorkspace();
    let repo = options.repo;

    if (!workspace || !repo) {
      const remoteInfo = await getRemoteInfo();
      if (remoteInfo) {
        workspace = workspace || remoteInfo.workspace;
        repo = repo || remoteInfo.repo;
      }
    }

    if (!workspace || !repo) {
      throw new Error(
        'Could not determine workspace and repository. Please specify --workspace and --repo or run from a git repository.'
      );
    }

    const client = getBitbucketClient();

    const response = await client.get(`/repositories/${workspace}/${repo}/pullrequests/${prId}`);
    const pr = response.data;

    displaySection(`PR #${pr.id}: ${pr.title}`);

    const stateColor = getStateColor(pr.state);
    displayKeyValue('State', badge(pr.state, stateColor));
    displayKeyValue('Author', pr.author.display_name || pr.author.nickname);
    displayKeyValue('Source', pr.source.branch.name);
    displayKeyValue('Destination', pr.destination.branch.name);
    displayKeyValue('Created', formatDateTime(pr.created_on));
    displayKeyValue('Updated', formatDateTime(pr.updated_on));

    if (pr.description) {
      console.log();
      console.log(pc.bold('Description:'));
      console.log(pr.description);
    }

    const commitsResponse = await client.get(
      `/repositories/${workspace}/${repo}/pullrequests/${prId}/commits`
    );
    const commits = commitsResponse.data.values;

    if (commits.length > 0) {
      console.log();
      console.log(pc.bold(`Commits (${commits.length}):`));
      commits.forEach((commit: { hash: string; message: string }) => {
        const shortHash = commit.hash.substring(0, 7);
        const message = commit.message.split('\n')[0];
        console.log(`  ${pc.cyan(shortHash)} ${message}`);
      });
    }

    try {
      const diffstatResponse = await client.get(
        `/repositories/${workspace}/${repo}/pullrequests/${prId}/diffstat`
      );
      const diffstat = diffstatResponse.data.values;

      if (diffstat.length > 0) {
        let linesAdded = 0;
        let linesRemoved = 0;

        diffstat.forEach((file: { lines_added: number; lines_removed: number }) => {
          linesAdded += file.lines_added || 0;
          linesRemoved += file.lines_removed || 0;
        });

        console.log();
        displayKeyValue('Files changed', String(diffstat.length));
        displayKeyValue('Lines added', pc.green(`+${linesAdded}`));
        displayKeyValue('Lines removed', pc.red(`-${linesRemoved}`));
      }
    } catch {
      //
    }

    const participantsResponse = await client.get(
      `/repositories/${workspace}/${repo}/pullrequests/${prId}`
    );
    const participants = participantsResponse.data.participants;

    if (participants && participants.length > 0) {
      console.log();
      console.log(pc.bold('Reviewers:'));
      participants.forEach(
        (participant: {
          user: { display_name: string; nickname: string };
          approved: boolean;
          role: string;
        }) => {
          if (participant.role === 'REVIEWER') {
            const name = participant.user.display_name || participant.user.nickname;
            const status = participant.approved ? pc.green('✓ Approved') : pc.gray('Pending');
            console.log(`  ${name}: ${status}`);
          }
        }
      );
    }

    console.log();
    displayKeyValue(
      'URL',
      `https://bitbucket.org/${workspace}/${repo}/pull-requests/${pr.id}`
    );
  } catch (error) {
    handleError(error);
  }
}
