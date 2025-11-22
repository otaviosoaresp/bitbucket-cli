import { getBitbucketClient } from '../../core/client';
import { getWorkspace } from '../../core/config';
import { getRemoteInfo } from '../../core/git';
import { handleError, displaySuccess } from '../../utils/errors';

interface UpdateOptions {
  workspace?: string;
  repo?: string;
  title?: string;
  description?: string;
  destination?: string;
}

export async function updatePR(prId: string, options: UpdateOptions): Promise<void> {
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

    const payload: {
      title?: string;
      description?: string;
      destination?: { branch: { name: string } };
    } = {};

    if (options.title) {
      payload.title = options.title;
    }

    if (options.description) {
      payload.description = options.description;
    }

    if (options.destination) {
      payload.destination = {
        branch: {
          name: options.destination,
        },
      };
    }

    if (Object.keys(payload).length === 0) {
      throw new Error(
        'Nothing to update. Please specify --title, --description, or --destination.'
      );
    }

    await client.put(`/repositories/${workspace}/${repo}/pullrequests/${prId}`, payload);

    displaySuccess(`PR #${prId} updated successfully`);
  } catch (error) {
    handleError(error);
  }
}
