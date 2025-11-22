import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getTemplatesDirectory } from '../core/config';

const DEFAULT_TEMPLATE = `## Summary
<!-- Brief description of what this PR does -->

## Changes
<!-- List of changes made -->
-

## Testing
<!-- How to test these changes -->
-

## Notes
<!-- Any additional notes or context -->
`;

export function createDefaultTemplate(): void {
  const templatesDir = getTemplatesDirectory();
  const defaultTemplatePath = join(templatesDir, 'default.md');

  if (!existsSync(defaultTemplatePath)) {
    writeFileSync(defaultTemplatePath, DEFAULT_TEMPLATE, 'utf-8');
  }
}

export function getTemplate(templateName?: string): string {
  const templatesDir = getTemplatesDirectory();
  const templateFileName = templateName ? `${templateName}.md` : 'default.md';
  const templatePath = join(templatesDir, templateFileName);

  if (!existsSync(templatePath)) {
    createDefaultTemplate();
    return DEFAULT_TEMPLATE;
  }

  return readFileSync(templatePath, 'utf-8');
}

export function listTemplates(): string[] {
  const templatesDir = getTemplatesDirectory();

  if (!existsSync(templatesDir)) {
    return [];
  }

  const files = readdirSync(templatesDir);
  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}

export function applyTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}
