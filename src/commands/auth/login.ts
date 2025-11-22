import { createInterface } from 'readline';
import axios from 'axios';
import pc from 'picocolors';
import { setApiToken, setWorkspace, setUsername } from '../../core/config';
import { clearClientCache } from '../../core/client';
import { handleError, displaySuccess, displayInfo } from '../../utils/errors';

async function promptForInput(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function validateApiToken(username: string, apiToken: string): Promise<boolean> {
  try {
    const credentials = Buffer.from(`${username}:${apiToken}`).toString('base64');
    const response = await axios.get('https://api.bitbucket.org/2.0/user', {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(pc.red(`API Error: ${error.response?.status} - ${error.response?.statusText}`));
      if (error.response?.data) {
        console.error(pc.red(`Details: ${JSON.stringify(error.response.data)}`));
      }
    }
    return false;
  }
}

async function getWorkspaces(username: string, apiToken: string): Promise<Array<{ slug: string; name: string }>> {
  try {
    const credentials = Buffer.from(`${username}:${apiToken}`).toString('base64');
    const response = await axios.get('https://api.bitbucket.org/2.0/workspaces', {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    return response.data.values.map((workspace: { slug: string; name: string }) => ({
      slug: workspace.slug,
      name: workspace.name,
    }));
  } catch {
    return [];
  }
}

export async function login(): Promise<void> {
  try {
    console.log();
    displayInfo('Bitbucket API authentication');
    console.log();
    console.log('To obtain an API token:');
    console.log(`1. Go to ${pc.cyan('https://id.atlassian.com/manage-profile/security/api-tokens')}`);
    console.log('2. Click "Create API token"');
    console.log('3. Give it a label and copy the generated token');
    console.log();

    const username = await promptForInput('Enter your Atlassian account email: ');

    if (!username) {
      console.error(pc.red('Error: Email cannot be empty'));
      process.exit(1);
    }

    const apiToken = await promptForInput('Enter your Atlassian API token: ');

    if (!apiToken) {
      console.error(pc.red('Error: API token cannot be empty'));
      process.exit(1);
    }

    displayInfo('Validating credentials...');

    const isValid = await validateApiToken(username, apiToken);

    if (!isValid) {
      console.error(pc.red('Error: Invalid credentials. Please check your email and API token.'));
      process.exit(1);
    }

    setUsername(username);
    setApiToken(apiToken);
    clearClientCache();

    displaySuccess('Credentials saved successfully');

    displayInfo('Fetching workspaces...');
    const workspaces = await getWorkspaces(username, apiToken);

    if (workspaces.length > 0) {
      console.log();
      console.log(pc.bold('Available workspaces:'));
      workspaces.forEach((ws, index) => {
        console.log(`  ${index + 1}. ${ws.name} (${pc.cyan(ws.slug)})`);
      });
      console.log();

      const workspaceSlug = await promptForInput(
        'Enter default workspace slug (optional, press Enter to skip): '
      );

      if (workspaceSlug) {
        setWorkspace(workspaceSlug);
        displaySuccess(`Default workspace set to: ${workspaceSlug}`);
      }
    }

    console.log();
    displaySuccess('Authentication configured successfully!');
  } catch (error) {
    handleError(error);
  }
}
