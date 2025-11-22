import axios, { AxiosInstance } from 'axios';
import { getApiToken, getUsername } from './config';

let cachedClient: AxiosInstance | null = null;

export function getBitbucketClient(): AxiosInstance {
  const apiToken = getApiToken();
  const username = getUsername();

  if (!apiToken || !username) {
    throw new Error(
      'No API credentials found. Run "bitbucket auth login" to configure authentication.'
    );
  }

  if (!cachedClient) {
    const credentials = Buffer.from(`${username}:${apiToken}`).toString('base64');

    cachedClient = axios.create({
      baseURL: 'https://api.bitbucket.org/2.0',
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  return cachedClient;
}

export function clearClientCache(): void {
  cachedClient = null;
}
