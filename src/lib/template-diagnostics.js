import fs from 'fs';
import path from 'path';
import {
  getAllTemplateManifests,
  getTemplateManifest,
  validateTemplateManifest,
} from '@/lib/template-system';

function fileExists(relativePath) {
  if (!relativePath || typeof relativePath !== 'string' || !relativePath.startsWith('/')) {
    return false;
  }

  const absolutePath = path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''));
  return fs.existsSync(absolutePath);
}

function getBindingDiagnostics(manifest) {
  const issues = [];

  const keys = new Set();
  manifest.editableFields.forEach((field) => {
    if (keys.has(field.key)) {
      issues.push({
        level: 'error',
        code: 'duplicate-field-key',
        message: `Duplicate field key detected: ${field.key}`,
      });
    }
    keys.add(field.key);

    if (!field.type) {
      issues.push({
        level: 'error',
        code: 'missing-field-type',
        message: `Field ${field.key} is missing a type.`,
      });
    }

    if (manifest.capabilities.requiresNativeAdapter && !field.selector) {
      issues.push({
        level: 'warning',
        code: 'native-adapter-pending',
        message: `Field ${field.key} still needs a native adapter selector for ${manifest.slug}.`,
      });
    }
  });

  if (manifest.capabilities.requiresNativeAdapter) {
    issues.push({
      level: 'warning',
      code: 'manual-adapter-required',
      message: `Template ${manifest.slug} still requires a native adapter for fully reliable visual bindings.`,
    });
  }

  return issues;
}

export function getTemplateDiagnostics(slug) {
  const manifest = getTemplateManifest(slug);

  if (!manifest) {
    return {
      slug,
      status: 'error',
      issues: [
        {
          level: 'error',
          code: 'missing-manifest',
          message: `No manifest registered for ${slug}.`,
        },
      ],
    };
  }

  const parseResult = validateTemplateManifest(manifest);
  const issues = [];

  if (!parseResult.success) {
    parseResult.error.issues.forEach((issue) => {
      issues.push({
        level: 'error',
        code: 'invalid-manifest',
        message: issue.message,
        path: issue.path.join('.'),
      });
    });
  }

  if (!fileExists(manifest.previewImage)) {
    issues.push({
      level: 'warning',
      code: 'missing-preview-image',
      message: `Preview image was not found for ${slug}: ${manifest.previewImage || 'missing path'}`,
    });
  }

  issues.push(...getBindingDiagnostics(manifest));

  return {
    slug,
    status: issues.some((issue) => issue.level === 'error')
      ? 'error'
      : issues.length > 0
        ? 'warning'
        : 'ok',
    issues,
  };
}

export function getAllTemplateDiagnostics() {
  return getAllTemplateManifests().map((manifest) => getTemplateDiagnostics(manifest.slug));
}
