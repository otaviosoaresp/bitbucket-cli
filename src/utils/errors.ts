import pc from 'picocolors';
import { AxiosError } from 'axios';

export function handleError(error: unknown): void {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.message;

      if (status === 401) {
        console.error(pc.red('Error: Authentication failed. Please check your API token.'));
      } else if (status === 403) {
        console.error(pc.red('Error: Access denied. You do not have permission to perform this action.'));
      } else if (status === 404) {
        console.error(pc.red('Error: Resource not found.'));
      } else {
        console.error(pc.red(`Error: ${message}`));
      }
    } else if (error.request) {
      console.error(pc.red('Error: No response from Bitbucket API. Please check your connection.'));
    } else {
      console.error(pc.red(`Error: ${error.message}`));
    }
  } else if (error instanceof Error) {
    console.error(pc.red(`Error: ${error.message}`));
  } else {
    console.error(pc.red('An unexpected error occurred'));
  }

  process.exit(1);
}

export function displaySuccess(message: string): void {
  console.log(pc.green(`✓ ${message}`));
}

export function displayWarning(message: string): void {
  console.log(pc.yellow(`⚠ ${message}`));
}

export function displayInfo(message: string): void {
  console.log(pc.cyan(`ℹ ${message}`));
}
