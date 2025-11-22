import { getBitbucketClient } from '../../core/client';
import { getWorkspace } from '../../core/config';
import { getRemoteInfo } from '../../core/git';
import { handleError, displaySuccess } from '../../utils/errors';

interface MergeOptions {
  workspace?: string;
  repo?: string;
  strategy?: 'merge_commit' | 'squash' | 'fast_forward';
  message?: string;
  closeSourceBranch?: boolean;
}

export async function mergePR(prId: string, options: MergeOptions): Promise<void> {
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
      type?: string;
      message?: string;
      close_source_branch?: boolean;
      merge_strategy?: string;
    } = {};

    if (options.message) {
      payload.message = options.message;
    }

    if (options.closeSourceBranch !== undefined) {
      payload.close_source_branch = options.closeSourceBranch;
    }

    if (options.strategy) {
      payload.merge_strategy = options.strategy;
    }

    await client.post(`/repositories/${workspace}/${repo}/pullrequests/${prId}/merge`, payload);

    displaySuccess(`PR #${prId} merged successfully`);
  } catch (error) {
    handleError(error);
  }
}
