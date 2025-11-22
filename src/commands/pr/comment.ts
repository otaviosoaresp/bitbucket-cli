import pc from 'picocolors';
import { getBitbucketClient } from '../../core/client';
import { getWorkspace } from '../../core/config';
import { getRemoteInfo } from '../../core/git';
import { handleError, displaySuccess } from '../../utils/errors';
import { formatRelativeTime } from '../../utils/display';

interface CommentOptions {
  workspace?: string;
  repo?: string;
  body?: string;
  list?: boolean;
}

export async function handleComments(prId: string, options: CommentOptions): Promise<void> {
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

    if (options.body) {
      await createComment(prId, options.body, workspace, repo);
    } else {
      await listComments(prId, workspace, repo);
    }
  } catch (error) {
    handleError(error);
  }
}

async function listComments(
  prId: string,
  workspace: string,
  repo: string
): Promise<void> {
  const client = getBitbucketClient();

  const response = await client.get(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}/comments`
  );

  const comments = response.data.values;

  if (comments.length === 0) {
    console.log('No comments found');
    return;
  }

  console.log(pc.bold(`Comments on PR #${prId}:`));
  console.log();

  comments.forEach(
    (comment: {
      id: number;
      user: { display_name: string; nickname: string };
      created_on: string;
      content: { raw: string };
    }) => {
      const author = comment.user.display_name || comment.user.nickname;
      const time = formatRelativeTime(comment.created_on);

      console.log(pc.cyan(`${author} • ${time}`));
      console.log(comment.content.raw);
      console.log();
    }
  );
}

async function createComment(
  prId: string,
  body: string,
  workspace: string,
  repo: string
): Promise<void> {
  const client = getBitbucketClient();

  await client.post(`/repositories/${workspace}/${repo}/pullrequests/${prId}/comments`, {
    content: {
      raw: body,
    },
  });

  displaySuccess(`Comment added to PR #${prId}`);
}
