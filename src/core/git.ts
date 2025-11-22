import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';

const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
};

const git: SimpleGit = simpleGit(options);

export interface GitRemoteInfo {
  workspace: string;
  repo: string;
}

export async function getCurrentBranch(): Promise<string> {
  const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
  return branch.trim();
}

export async function getRemoteInfo(remoteName: string = 'origin'): Promise<GitRemoteInfo | null> {
  try {
    const remotes = await git.getRemotes(true);
    const remote = remotes.find((r) => r.name === remoteName);

    if (!remote || !remote.refs.fetch) {
      return null;
    }

    const match = remote.refs.fetch.match(/bitbucket\.org[:/]([^/]+)\/([^/.]+)/);

    if (!match) {
      return null;
    }

    return {
      workspace: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  } catch {
    return null;
  }
}

export async function isGitRepository(): Promise<boolean> {
  try {
    await git.revparse(['--is-inside-work-tree']);
    return true;
  } catch {
    return false;
  }
}

export async function getBranchList(): Promise<string[]> {
  const branches = await git.branch();
  return branches.all.map((branch) => branch.replace('remotes/origin/', ''));
}

export async function hasUncommittedChanges(): Promise<boolean> {
  const status = await git.status();
  return status.files.length > 0;
}
