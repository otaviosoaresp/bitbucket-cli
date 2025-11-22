# Contributing to Bitbucket CLI

Thank you for your interest in contributing to Bitbucket CLI!

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- A Bitbucket Cloud account
- Git

### Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd bitbucket-cli
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Link the CLI locally:

```bash
npm link
```

Now you can use `bitbucket` command globally, pointing to your local development version.

## Project Structure

```
bitbucket-cli/
├── src/
│   ├── commands/          # CLI commands
│   │   ├── auth/         # Authentication commands
│   │   └── pr/           # Pull request commands
│   ├── core/             # Core functionality
│   │   ├── config.ts     # Configuration management
│   │   ├── client.ts     # API client
│   │   └── git.ts        # Git integration
│   ├── utils/            # Utility functions
│   │   ├── colors.ts     # Color handling
│   │   ├── display.ts    # Display/formatting
│   │   ├── errors.ts     # Error handling
│   │   ├── filters.ts    # Query parameter building
│   │   └── templates.ts  # Template management
│   └── index.ts          # Entry point
├── templates-examples/    # Example PR templates
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

### Watch Mode

For active development, use watch mode:

```bash
npm run dev
```

This will automatically recompile TypeScript files on changes.

### Testing Changes

After making changes:

1. Build the project:

```bash
npm run build
```

2. Test your changes:

```bash
bitbucket <command> <args>
```

Or run directly with Node:

```bash
node dist/index.js <command> <args>
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer specific types over `any`
- No unused variables or parameters
- Explicit return types for functions
- Use interfaces for complex types

Example:

```typescript
interface CreateOptions {
  title?: string;
  description?: string;
}

export async function createPR(options: CreateOptions): Promise<void> {
  // Implementation
}
```

### Naming Conventions

- **Files**: kebab-case (`pr-list.ts`) or camelCase (`display.ts`)
- **Functions**: camelCase (`getBitbucketClient`, `displayTable`)
- **Constants**: UPPER_SNAKE_CASE (`CONFIG_DIR`, `API_BASE_URL`)
- **Interfaces**: PascalCase (`ListOptions`, `GitRemoteInfo`)
- **Types**: PascalCase (`PullRequest`, `CommentOptions`)

### Code Organization

- **Single Responsibility**: Each function should do one thing
- **Early Returns**: Use early returns to avoid deep nesting
- **Error Handling**: Always use try-catch for async operations
- **Type Guards**: Use type guards for error handling

Example:

```typescript
export function handleError(error: unknown): void {
  if (error instanceof AxiosError) {
    // Handle Axios errors
  } else if (error instanceof Error) {
    // Handle generic errors
  } else {
    // Handle unknown errors
  }
  process.exit(1);
}
```

## Adding New Commands

1. Create command file in appropriate directory:

```bash
src/commands/<category>/<command-name>.ts
```

2. Implement the command function:

```typescript
import { getBitbucketClient } from '../../core/client';
import { handleError, displaySuccess } from '../../utils/errors';

interface MyCommandOptions {
  option1?: string;
  option2?: number;
}

export async function myCommand(options: MyCommandOptions): Promise<void> {
  try {
    const client = getBitbucketClient();

    // Your implementation here

    displaySuccess('Command completed successfully');
  } catch (error) {
    handleError(error);
  }
}
```

3. Register the command in `src/index.ts`:

```typescript
import { myCommand } from './commands/<category>/<command-name>';

// Add to appropriate command group
pr.command('my-command')
  .description('Description of what this command does')
  .option('--option1 <value>', 'Description of option1')
  .option('--option2 <number>', 'Description of option2')
  .action((options) => {
    myCommand({
      option1: options.option1,
      option2: parseInt(options.option2, 10),
    });
  });
```

4. Update documentation in README.md

## Adding New Features

### Git Integration

Use the `git.ts` utilities for git operations:

```typescript
import { getCurrentBranch, getRemoteInfo } from '../core/git';

const branch = await getCurrentBranch();
const remote = await getRemoteInfo();
```

### Configuration

Use the `config.ts` utilities for configuration:

```typescript
import { getWorkspace, setWorkspace } from '../core/config';

const workspace = getWorkspace();
setWorkspace('new-workspace');
```

### API Calls

Always use the singleton client:

```typescript
import { getBitbucketClient } from '../core/client';

const client = getBitbucketClient();
const response = await client.get('/repositories/workspace/repo/pullrequests');
```

### Display

Use the display utilities for consistent output:

```typescript
import { displayTable, displayKeyValue, displaySection } from '../utils/display';

displaySection('Pull Request Details');
displayKeyValue('Title', pr.title);
displayKeyValue('State', pr.state);
```

## Testing

### Manual Testing

1. Build the project
2. Link it locally with `npm link`
3. Test commands with real Bitbucket API
4. Verify output and error handling

### Test Checklist

- [ ] Command executes without errors
- [ ] Error messages are clear and helpful
- [ ] Output is well-formatted
- [ ] Help text is accurate (`--help`)
- [ ] Options work as expected
- [ ] Edge cases are handled

## Pull Request Guidelines

1. **Branch**: Create a feature branch from `main`

```bash
git checkout -b feature/my-feature
```

2. **Commits**: Write clear commit messages

```bash
git commit -m "Add support for pipeline commands"
```

3. **Code Quality**: Ensure code compiles without errors

```bash
npm run build
```

4. **Documentation**: Update README.md if adding new features

5. **Pull Request**: Create PR with clear description
   - What does this PR do?
   - Why is this change needed?
   - How to test the changes?

## Common Issues

### TypeScript Errors

If you get TypeScript errors, ensure:
- All types are properly defined
- No unused variables or parameters
- Return types are explicit
- Imports are correct

### API Errors

If API calls fail:
- Check if API token is valid
- Verify API endpoint in Bitbucket documentation
- Check request payload format
- Look at error response for details

### Build Errors

If build fails:
- Delete `dist/` and rebuild
- Check `tsconfig.json` for correct settings
- Ensure all dependencies are installed

## Resources

- [Bitbucket Cloud REST API Documentation](https://developer.atlassian.com/cloud/bitbucket/rest/)
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Questions?

If you have questions, please:
1. Check existing documentation
2. Search for similar issues
3. Create a new issue with detailed description

Thank you for contributing!
