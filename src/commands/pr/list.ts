import { getBitbucketClient } from '../../core/client';
import { getWorkspace } from '../../core/config';
import { getRemoteInfo } from '../../core/git';
import { handleError } from '../../utils/errors';
import { displayTable, formatRelativeTime } from '../../utils/display';
import { getStateColor, badge } from '../../utils/colors';

interface ListOptions {
  state?: string;
  author?: string;
  limit?: number;
  workspace?: string;
  repo?: string;
}

interface PullRequest {
  id: number;
  title: string;
  state: string;
  author: {
    display_name: string;
    nickname: string;
  };
  created_on: string;
  updated_on: string;
  source: {
    branch: {
      name: string;
    };
  };
  destination: {
    branch: {
      name: string;
    };
  };
}

export async function listPRs(options: ListOptions): Promise<void> {
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

    const params: Record<string, string | number> = {};

    if (options.state) {
      params.state = options.state.toUpperCase();
    }

    if (options.limit) {
      params.pagelen = options.limit;
    } else {
      params.pagelen = 50;
    }

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const url = `/repositories/${workspace}/${repo}/pullrequests${queryString ? `?${queryString}` : ''}`;

    const response = await client.get(url);
    const pullRequests: PullRequest[] = response.data.values;

    if (pullRequests.length === 0) {
      console.log('No pull requests found');
      return;
    }

    const columns = [
      { header: 'ID', width: 6, align: 'right' as const },
      { header: 'Title', width: 50 },
      { header: 'State', width: 12 },
      { header: 'Author', width: 20 },
      { header: 'Branch', width: 25 },
      { header: 'Updated', width: 15 },
    ];

    const rows = pullRequests.map((pr) => {
      const stateColor = getStateColor(pr.state);
      const stateBadge = badge(pr.state, stateColor);

      return [
        `#${pr.id}`,
        pr.title,
        stateBadge,
        pr.author.display_name || pr.author.nickname,
        `${pr.source.branch.name} → ${pr.destination.branch.name}`,
        formatRelativeTime(pr.updated_on),
      ];
    });

    displayTable(columns, rows);
  } catch (error) {
    handleError(error);
  }
}
