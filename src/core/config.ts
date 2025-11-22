import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

interface Config {
  username?: string;
  apiToken?: string;
  workspace?: string;
  defaultRepo?: string;
}

const CONFIG_DIR = join(homedir(), '.config', 'bitbucket-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const TEMPLATES_DIR = join(CONFIG_DIR, 'templates');

export function ensureConfigDirectory(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function ensureTemplatesDirectory(): void {
  if (!existsSync(TEMPLATES_DIR)) {
    mkdirSync(TEMPLATES_DIR, { recursive: true });
  }
}

export function getTemplatesDirectory(): string {
  ensureTemplatesDirectory();
  return TEMPLATES_DIR;
}

export function loadConfig(): Config {
  ensureConfigDirectory();

  if (!existsSync(CONFIG_FILE)) {
    return {};
  }

  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDirectory();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function getApiToken(): string | undefined {
  const envToken = process.env.BITBUCKET_API_TOKEN;
  if (envToken) {
    return envToken;
  }

  const config = loadConfig();
  return config.apiToken;
}

export function setApiToken(apiToken: string): void {
  const config = loadConfig();
  config.apiToken = apiToken;
  saveConfig(config);
}

export function getWorkspace(): string | undefined {
  const envWorkspace = process.env.BITBUCKET_WORKSPACE;
  if (envWorkspace) {
    return envWorkspace;
  }

  const config = loadConfig();
  return config.workspace;
}

export function setWorkspace(workspace: string): void {
  const config = loadConfig();
  config.workspace = workspace;
  saveConfig(config);
}

export function getDefaultRepo(): string | undefined {
  const config = loadConfig();
  return config.defaultRepo;
}

export function setDefaultRepo(repo: string): void {
  const config = loadConfig();
  config.defaultRepo = repo;
  saveConfig(config);
}

export function getUsername(): string | undefined {
  const envUsername = process.env.BITBUCKET_USERNAME;
  if (envUsername) {
    return envUsername;
  }

  const config = loadConfig();
  return config.username;
}

export function setUsername(username: string): void {
  const config = loadConfig();
  config.username = username;
  saveConfig(config);
}
