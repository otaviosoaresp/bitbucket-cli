#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import { login } from './commands/auth/login';
import { listPRs } from './commands/pr/list';
import { viewPR } from './commands/pr/view';
import { createPR } from './commands/pr/create';
import { updatePR } from './commands/pr/update';
import { handleComments } from './commands/pr/comment';
import { approvePR } from './commands/pr/approve';
import { mergePR } from './commands/pr/merge';

config();

const program = new Command();

program
  .name('bitbucket')
  .description('Command-line interface for Bitbucket')
  .version('0.1.0');

const auth = program.command('auth').description('Manage authentication');

auth
  .command('login')
  .description('Authenticate with Bitbucket API')
  .action(login);

const pr = program.command('pr').description('Manage pull requests');

pr.command('list')
  .description('List pull requests')
  .option('--state <state>', 'Filter by state: OPEN, MERGED, DECLINED, SUPERSEDED')
  .option('--author <username>', 'Filter by author username')
  .option('--limit <number>', 'Limit number of results', '50')
  .option('--workspace <workspace>', 'Workspace slug')
  .option('--repo <repo>', 'Repository slug')
  .action((options) => {
    listPRs({
      state: options.state,
      author: options.author,
      limit: parseInt(options.limit, 10),
      workspace: options.workspace,
      repo: options.repo,
    });
  });

pr.command('view')
  .description('View pull request details')
  .argument('<pr-id>', 'Pull request ID')
  .option('--workspace <workspace>', 'Workspace slug')
  .option('--repo <repo>', 'Repository slug')
  .action((prId, options) => {
    viewPR(prId, {
      workspace: options.workspace,
      repo: options.repo,
    });
  });

pr.command('create')
  .description('Create a new pull request')
  .option('--title <title>', 'Pull request title')
  .option('--description <description>', 'Pull request description')
  .option('--source <branch>', 'Source branch')
  .option('--destination <branch>', 'Destination branch (default: main)')
  .option('--workspace <workspace>', 'Workspace slug')
  .option('--repo <repo>', 'Repository slug')
  .option('--template <name>', 'Template name to use')
  .option('-i, --interactive', 'Create PR interactively')
  .action((options) => {
    createPR({
      title: options.title,
      description: options.description,
      source: options.source,
      destination: options.destination,
      workspace: options.workspace,
      repo: options.repo,
      template: options.template,
      interactive: options.interactive,
    });
  });

pr.command('update')
  .description('Update an existing pull request')
  .argument('<pr-id>', 'Pull request ID')
  .option('--title <title>', 'New pull request title')
  .option('--description <description>', 'New pull request description')
  .option('--destination <branch>', 'New destination branch')
  .option('--workspace <workspace>', 'Workspace slug')
  .option('--repo <repo>', 'Repository slug')
  .action((prId, options) => {
    updatePR(prId, {
      workspace: options.workspace,
      repo: options.repo,
      title: options.title,
      description: options.description,
      destination: options.destination,
    });
  });

pr.command('comment')
  .description('Manage pull request comments')
  .argument('<pr-id>', 'Pull request ID')
  .option('--body <text>', 'Comment body (creates new comment)')
  .option('--list', 'List comments')
  .option('--workspace <workspace>', 'Workspace slug')
  .option('--repo <repo>', 'Repository slug')
  .action((prId, options) => {
    handleComments(prId, {
      workspace: options.workspace,
      repo: options.repo,
      body: options.body,
      list: options.list,
    });
  });

pr.command('approve')
  .description('Approve or unapprove a pull request')
  .argument('<pr-id>', 'Pull request ID')
  .option('--unapprove', 'Unapprove the pull request')
  .option('--workspace <workspace>', 'Workspace slug')
  .option('--repo <repo>', 'Repository slug')
  .action((prId, options) => {
    approvePR(prId, {
      workspace: options.workspace,
      repo: options.repo,
      unapprove: options.unapprove,
    });
  });

pr.command('merge')
  .description('Merge a pull request')
  .argument('<pr-id>', 'Pull request ID')
  .option('--strategy <strategy>', 'Merge strategy: merge_commit, squash, fast_forward')
  .option('--message <message>', 'Merge commit message')
  .option('--close-source-branch', 'Close source branch after merge')
  .option('--workspace <workspace>', 'Workspace slug')
  .option('--repo <repo>', 'Repository slug')
  .action((prId, options) => {
    mergePR(prId, {
      workspace: options.workspace,
      repo: options.repo,
      strategy: options.strategy,
      message: options.message,
      closeSourceBranch: options.closeSourceBranch,
    });
  });

program.parse();
