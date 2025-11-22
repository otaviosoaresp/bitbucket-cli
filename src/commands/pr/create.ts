import inquirer from 'inquirer';
import pc from 'picocolors';
import { getBitbucketClient } from '../../core/client';
import { getWorkspace } from '../../core/config';
import { getCurrentBranch, getRemoteInfo } from '../../core/git';
import { handleError, displaySuccess, displayInfo } from '../../utils/errors';
import { getTemplate, applyTemplateVariables } from '../../utils/templates';

interface CreateOptions {
  title?: string;
  description?: string;
  source?: string;
  destination?: string;
  workspace?: string;
  repo?: string;
  template?: string;
  interactive?: boolean;
}

async function getWorkspaceMembers(
  workspace: string
): Promise<Array<{ uuid: string; display_name: string; nickname: string }>> {
  try {
    const client = getBitbucketClient();
    const response = await client.get(`/workspaces/${workspace}/members`);
    return response.data.values.map(
      (member: { user: { uuid: string; display_name: string; nickname: string } }) => member.user
    );
  } catch {
    return [];
  }
}

export async function createPR(options: CreateOptions): Promise<void> {
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

    let title = options.title;
    let description = options.description;
    let source = options.source;
    let destination = options.destination || 'main';

    if (!source) {
      source = await getCurrentBranch();
    }

    if (options.interactive || !title) {
      displayInfo('Creating pull request interactively');
      console.log();

      const template = getTemplate(options.template);

      const templateWithVars = applyTemplateVariables(template, {
        branch: source,
        workspace,
        repo,
      });

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Pull request title:',
          default: title,
          validate: (input: string) => (input.trim() ? true : 'Title is required'),
        },
        {
          type: 'input',
          name: 'destination',
          message: 'Destination branch:',
          default: destination,
        },
        {
          type: 'editor',
          name: 'description',
          message: 'Pull request description:',
          default: description || templateWithVars,
        },
      ]);

      title = answers.title;
      destination = answers.destination;
      description = answers.description;

      const members = await getWorkspaceMembers(workspace);

      if (members.length > 0) {
        const reviewerAnswer = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'reviewers',
            message: 'Select reviewers (optional):',
            choices: members.map((member) => ({
              name: member.display_name || member.nickname,
              value: member.uuid,
            })),
          },
        ]);

        if (reviewerAnswer.reviewers && reviewerAnswer.reviewers.length > 0) {
          const client = getBitbucketClient();

          const payload = {
            title,
            description,
            source: {
              branch: {
                name: source,
              },
            },
            destination: {
              branch: {
                name: destination,
              },
            },
            reviewers: reviewerAnswer.reviewers.map((uuid: string) => ({ uuid })),
          };

          const response = await client.post(
            `/repositories/${workspace}/${repo}/pullrequests`,
            payload
          );

          const pr = response.data;

          console.log();
          displaySuccess(`Pull request created: PR #${pr.id}`);
          console.log(
            `${pc.cyan('URL')}: https://bitbucket.org/${workspace}/${repo}/pull-requests/${pr.id}`
          );
          return;
        }
      }
    }

    if (!title) {
      throw new Error('Title is required. Use --title or --interactive flag.');
    }

    const client = getBitbucketClient();

    const payload = {
      title,
      description,
      source: {
        branch: {
          name: source,
        },
      },
      destination: {
        branch: {
          name: destination,
        },
      },
    };

    const response = await client.post(`/repositories/${workspace}/${repo}/pullrequests`, payload);

    const pr = response.data;

    console.log();
    displaySuccess(`Pull request created: PR #${pr.id}`);
    console.log(
      `${pc.cyan('URL')}: https://bitbucket.org/${workspace}/${repo}/pull-requests/${pr.id}`
    );
  } catch (error) {
    handleError(error);
  }
}
