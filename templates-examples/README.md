# PR Templates Examples

This directory contains example PR templates that you can use as a starting point.

## How to Use

1. Copy the templates you want to your templates directory:

```bash
cp templates-examples/*.md ~/.config/bitbucket-cli/templates/
```

2. Use them when creating a PR:

```bash
# Use the feature template
bitbucket pr create -i --template feature

# Use the bugfix template
bitbucket pr create -i --template bugfix

# Use the refactor template
bitbucket pr create -i --template refactor
```

## Available Templates

- **default.md**: Basic template for general PRs
- **feature.md**: Template for new features with checklist
- **bugfix.md**: Template for bug fixes with root cause analysis
- **refactor.md**: Template for refactoring changes

## Creating Custom Templates

You can create your own templates by adding `.md` files to `~/.config/bitbucket-cli/templates/`.

### Template Variables

You can use the following variables in your templates:

- `{{branch}}`: Current branch name
- `{{workspace}}`: Workspace slug
- `{{repo}}`: Repository slug

Example:

```markdown
## Feature: {{branch}}

This PR adds a new feature to {{repo}}.
```

## Tips

- Keep templates focused and not too long
- Include checklists for common tasks
- Use markdown for formatting
- Add sections that make sense for your workflow
