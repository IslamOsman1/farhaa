import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function collectRouteFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectRouteFiles(target)));
      continue;
    }

    if (entry.isFile() && entry.name === 'route.js') {
      files.push(target);
    }
  }

  return files;
}

const routeFiles = await collectRouteFiles(join(process.cwd(), 'src', 'app', 'api'));
const findings = [];

for (const file of routeFiles) {
  if (file.includes(join('src', 'app', 'api', 'client'))) {
    continue;
  }
  const content = await readFile(file, 'utf8');
  const usesLegacySession = content.includes('getServerSession(');
  const usesPermissionHelper = content.includes('requirePermission(') || content.includes('requireAdminSession(');

  if (usesLegacySession && !usesPermissionHelper) {
    findings.push(file.replace(`${process.cwd()}\\`, ''));
  }
}

if (findings.length > 0) {
  console.log('Routes still using legacy auth checks:');
  findings.forEach((file) => console.log(`- ${file}`));
  process.exitCode = 1;
} else {
  console.log('All API routes appear to use centralized permission helpers.');
}
