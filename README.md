# Bitbucket CLI

Command-line interface for Bitbucket Cloud. Manage pull requests, repositories, and more directly from your terminal.

## Features

- List, view, create, and manage pull requests
- Interactive PR creation with templates
- Git integration (auto-detect workspace and repo from remotes)
- Approve and merge PRs from the command line
- Comment management
- Customizable PR templates

## Installation

```bash
npm install -g bitbucket-cli
```

Or install locally for development:

```bash
cd bitbucket-cli
npm install
npm run build
npm link
```

## Authentication

Before using the CLI, you need to authenticate with your Atlassian API token.

```bash
bitbucket auth login
```

### Creating an API Token

1. Go to **https://id.atlassian.com/manage-profile/security/api-tokens**
2. Click **"Create API token"**
3. Give it a label (e.g., "Bitbucket CLI")
4. Copy the generated token (shown only once)

**Required scopes for the token:**
- `read:user:bitbucket`
- `read:pullrequest:bitbucket`
- `read:project:bitbucket`
- `read:me`
- `read:account`
- `write:pullrequest:bitbucket`

The login command will:
1. Prompt you to enter your Atlassian account email
2. Prompt you to enter the API token
3. Validate the credentials
4. Save them to `~/.config/bitbucket-cli/config.json`
5. Optionally set a default workspace

### Alternative: Environment Variables

You can also set your credentials via environment variables:

```bash
export BITBUCKET_USERNAME=your_email@example.com
export BITBUCKET_API_TOKEN=your_token_here
export BITBUCKET_WORKSPACE=your_workspace_slug
```

## Usage

The CLI can be invoked using either `bitbucket` or `bb` (shorthand).

### Authentication

```bash
# Login to Bitbucket
bitbucket auth login
```

### Pull Requests

#### List Pull Requests

```bash
# List all open PRs in current repository
bitbucket pr list

# List with filters
bitbucket pr list --state MERGED --limit 10

# List for specific workspace/repo
bitbucket pr list --workspace myworkspace --repo myrepo
```

Options:
- `--state <state>`: Filter by state (OPEN, MERGED, DECLINED, SUPERSEDED)
- `--author <username>`: Filter by author username
- `--limit <number>`: Limit number of results (default: 50)
- `--workspace <workspace>`: Workspace slug
- `--repo <repo>`: Repository slug

#### View Pull Request

```bash
# View PR details
bitbucket pr view 123

# View PR in specific workspace/repo
bitbucket pr view 123 --workspace myworkspace --repo myrepo
```

Shows:
- PR title, state, author
- Source and destination branches
- Description
- Commit list
- Diff statistics
- Reviewers and approval status
- PR URL

#### Create Pull Request

```bash
# Create PR with title and description
bitbucket pr create --title "Feature: Add new component" --description "Description here"

# Create PR interactively (recommended)
bitbucket pr create -i

# Create PR with custom template
bitbucket pr create -i --template feature

# Create from specific branch
bitbucket pr create -i --source feature/my-branch --destination develop
```

Options:
- `-i, --interactive`: Interactive mode (prompts for input)
- `--title <title>`: PR title
- `--description <description>`: PR description
- `--source <branch>`: Source branch (defaults to current branch)
- `--destination <branch>`: Destination branch (defaults to main)
- `--template <name>`: Use a specific template
- `--workspace <workspace>`: Workspace slug
- `--repo <repo>`: Repository slug

#### Update Pull Request

```bash
# Update PR title
bitbucket pr update 123 --title "New title"

# Update PR description
bitbucket pr update 123 --description "Updated description"

# Update destination branch
bitbucket pr update 123 --destination develop

# Update multiple fields
bitbucket pr update 123 --title "New title" --description "New description"
```

Options:
- `--title <title>`: New PR title
- `--description <description>`: New PR description
- `--destination <branch>`: New destination branch
- `--workspace <workspace>`: Workspace slug
- `--repo <repo>`: Repository slug

#### Comment on Pull Request

```bash
# List comments
bitbucket pr comment 123

# Add a comment
bitbucket pr comment 123 --body "Looks good to me!"
```

#### Approve Pull Request

```bash
# Approve a PR
bitbucket pr approve 123

# Unapprove a PR
bitbucket pr approve 123 --unapprove
```

#### Merge Pull Request

```bash
# Merge a PR
bitbucket pr merge 123

# Merge with specific strategy
bitbucket pr merge 123 --strategy squash

# Merge and close source branch
bitbucket pr merge 123 --close-source-branch

# Merge with custom message
bitbucket pr merge 123 --message "Merged feature X"
```

Options:
- `--strategy <strategy>`: Merge strategy (merge_commit, squash, fast_forward)
- `--message <message>`: Custom merge commit message
- `--close-source-branch`: Close source branch after merge

## Templates

Templates allow you to pre-populate PR descriptions with a standard format.

### Template Location

Templates are stored in `~/.config/bitbucket-cli/templates/` as Markdown files.

### Default Template

The CLI comes with a default template. You can customize it by editing:

```bash
~/.config/bitbucket-cli/templates/default.md
```

### Creating Custom Templates

1. Create a new `.md` file in the templates directory:

```bash
vi ~/.config/bitbucket-cli/templates/feature.md
```

2. Add your template content with optional variables:

```markdown
## Feature: {{branch}}

### Summary
Brief description of the feature

### Changes
- Change 1
- Change 2

### Testing
How to test this feature

### Notes
Additional context
```

3. Use it when creating a PR:

```bash
bitbucket pr create -i --template feature
```

### Template Variables

Available variables:
- `{{branch}}`: Current branch name
- `{{workspace}}`: Workspace slug
- `{{repo}}`: Repository slug

## Git Integration

The CLI automatically detects your workspace and repository from git remotes:

```bash
# If your remote is: git@bitbucket.org:myworkspace/myrepo.git
# These are equivalent:
bitbucket pr list
bitbucket pr list --workspace myworkspace --repo myrepo
```

This works for both SSH and HTTPS remotes.

## Configuration

Configuration is stored in `~/.config/bitbucket-cli/config.json`:

```json
{
  "apiToken": "your_token",
  "workspace": "default_workspace",
  "defaultRepo": "default_repo"
}
```

Priority order:
1. Command-line options (`--workspace`, `--repo`)
2. Environment variables (`BITBUCKET_API_TOKEN`, `BITBUCKET_WORKSPACE`)
3. Git remote (auto-detected)
4. Config file

## Examples

### Complete PR Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/new-component

# 2. Make changes and commit
git add .
git commit -m "Add new component"

# 3. Push to Bitbucket
git push -u origin feature/new-component

# 4. Create PR interactively
bitbucket pr create -i

# 5. List your PRs
bitbucket pr list --author your-username

# 6. View PR details
bitbucket pr view 123

# 7. After review, merge
bitbucket pr merge 123 --strategy squash --close-source-branch
```

### Quick Commands

```bash
# List open PRs
bb pr list

# View specific PR
bb pr view 123

# Approve PR
bb pr approve 123

# Create PR from current branch
bb pr create -i
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Run Locally

```bash
npm start -- pr list
```

## Requirements

- Node.js >= 18.0.0
- Bitbucket Cloud account
- API token with appropriate permissions

## License

MIT
