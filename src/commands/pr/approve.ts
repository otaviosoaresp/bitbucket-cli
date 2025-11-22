import { getBitbucketClient } from '../../core/client';
import { getWorkspace } from '../../core/config';
import { getRemoteInfo } from '../../core/git';
import { handleError, displaySuccess } from '../../utils/errors';

interface ApproveOptions {
  workspace?: string;
  repo?: string;
  unapprove?: boolean;
}

export async function approvePR(prId: string, options: ApproveOptions): Promise<void> {
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

    if (options.unapprove) {
      await client.delete(`/repositories/${workspace}/${repo}/pullrequests/${prId}/approve`);
      displaySuccess(`PR #${prId} unapproved`);
    } else {
      await client.post(`/repositories/${workspace}/${repo}/pullrequests/${prId}/approve`);
      displaySuccess(`PR #${prId} approved`);
    }
  } catch (error) {
    handleError(error);
  }
}
