import fs from 'fs';
import path from 'path';
import {
  getAllTemplateManifests,
  getTemplateManifest,
  validateTemplateManifest,
} from '@/lib/template-system';

const SECTION_KEYS = ['hero', 'countdown', 'timeline', 'gallery', 'rsvp', 'notes', 'calendar'];
const OPENING_MARKERS = [
  'opening-screen',
  'openingoverlay',
  'preloader',
  'cover__',
  'cover-',
  'envelope',
  'door',
  'knock',
  'tap-hint',
  'hero-video',
  'openinghint',
];

function toPublicAbsolutePath(relativePath) {
  if (!relativePath || typeof relativePath !== 'string' || !relativePath.startsWith('/')) {
    return null;
  }

  return path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''));
}

function fileExists(relativePath) {
  const absolutePath = toPublicAbsolutePath(relativePath);
  return absolutePath ? fs.existsSync(absolutePath) : false;
}

function readUtf8IfExists(absolutePath) {
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return '';
  }

  try {
    return fs.readFileSync(absolutePath, 'utf8');
  } catch (error) {
    return '';
  }
}

function walkFiles(templateRoot) {
  if (!templateRoot || !fs.existsSync(templateRoot)) {
    return [];
  }

  const files = [];

  function visit(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    entries.forEach((entry) => {
      const absolutePath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
      } else {
        files.push(absolutePath);
      }
    });
  }

  visit(templateRoot);
  return files;
}

function getTemplateFileInventory(slug) {
  const templateRoot = path.join(process.cwd(), 'public', slug);
  const exists = fs.existsSync(templateRoot);
  const files = exists ? walkFiles(templateRoot) : [];
  const relativeFiles = files.map((filePath) => path.relative(templateRoot, filePath).replace(/\\/g, '/'));
  const indexHtml = files.find((filePath) => /(^|\\|\/)index\.html$/i.test(filePath)) || null;
  const scriptFiles = files.filter((filePath) => /(^|\\|\/)(script|main)\.js$/i.test(filePath));
  const styleFiles = files.filter((filePath) => /(^|\\|\/)(style|styles)\.css$/i.test(filePath));

  return {
    templateRoot,
    exists,
    files,
    relativeFiles,
    indexHtml,
    scriptFiles,
    styleFiles,
  };
}

function normalizeForSearch(value) {
  return String(value || '').toLowerCase();
}

function sourceHasId(source, idToken) {
  const escaped = idToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`id=["']${escaped}["']`, 'i'),
    new RegExp(`getelementbyid\\(["']${escaped}["']\\)`, 'i'),
    new RegExp(`#${escaped}\\b`, 'i'),
  ];
  return patterns.some((pattern) => pattern.test(source));
}

function sourceHasClass(source, classToken) {
  const escaped = classToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`class=["'][^"']*\\b${escaped}\\b`, 'i'),
    new RegExp(`\\.${escaped}\\b`, 'i'),
  ];
  return patterns.some((pattern) => pattern.test(source));
}

function sourceHasAttribute(source, attributeToken) {
  const escaped = attributeToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i').test(source);
}

function selectorTokenMatches(source, selector) {
  const idMatches = Array.from(selector.matchAll(/#([\w-]+)/g)).map((match) => match[1]);
  if (idMatches.some((token) => sourceHasId(source, token))) {
    return true;
  }

  const classMatches = Array.from(selector.matchAll(/\.([\w-]+)/g)).map((match) => match[1]);
  if (classMatches.some((token) => sourceHasClass(source, token))) {
    return true;
  }

  const attributeMatches = Array.from(selector.matchAll(/\[([^\]=~\^\$\*\|\s]+)/g)).map((match) => match[1]);
  if (attributeMatches.some((token) => sourceHasAttribute(source, token))) {
    return true;
  }

  const normalizedSelector = selector.trim().toLowerCase();
  if (!normalizedSelector) {
    return false;
  }

  return source.includes(normalizedSelector);
}

function selectorMatchesSource(source, selectorValue) {
  if (!selectorValue || typeof selectorValue !== 'string') {
    return false;
  }

  return selectorValue
    .split(',')
    .map((selector) => selector.trim())
    .filter(Boolean)
    .some((selector) => selectorTokenMatches(source, selector));
}

function getBindingDiagnostics(manifest, templateSource) {
  const issues = [];
  const fieldChecks = [];
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

    if (!field.selector) {
      fieldChecks.push({
        key: field.key,
        section: field.section || 'unknown',
        hasSelector: false,
        matched: false,
      });

      if (manifest.capabilities.requiresNativeAdapter) {
        issues.push({
          level: 'warning',
          code: 'native-adapter-pending',
          message: `Field ${field.key} still needs a native adapter selector for ${manifest.slug}.`,
        });
      }

      return;
    }

    const matched = selectorMatchesSource(templateSource, field.selector);
    fieldChecks.push({
      key: field.key,
      section: field.section || 'unknown',
      hasSelector: true,
      matched,
      selector: field.selector,
    });

    if (!matched) {
      issues.push({
        level: 'warning',
        code: 'binding-selector-not-found',
        message: `Field ${field.key} selector was not found inside ${manifest.slug}.`,
        selector: field.selector,
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

  if (manifest.capabilities.studioReady === false) {
    issues.push({
      level: 'warning',
      code: 'studio-not-ready',
      message: `Template ${manifest.slug} is intentionally hidden until its studio experience is completed.`,
    });
  }

  return { issues, fieldChecks };
}

function getSectionDiagnostics(manifest, templateSource) {
  const sectionChecks = [];
  const issues = [];

  SECTION_KEYS.forEach((sectionKey) => {
    const selectors = manifest.runtimeBindings?.sectionSelectors?.[sectionKey] || [];
    const matched = selectors.some((selector) => selectorMatchesSource(templateSource, selector));

    sectionChecks.push({
      key: sectionKey,
      declared: true,
      matched,
      selectors,
    });

    if (!matched) {
      issues.push({
        level: 'warning',
        code: 'section-selector-not-found',
        message: `Section ${sectionKey} was not detected inside ${manifest.slug}.`,
        section: sectionKey,
      });
    }
  });

  const heroMatched = ['#heroDate', '#heroGroom', '#heroBride', '.hero', '.hero__content']
    .some((selector) => selectorMatchesSource(templateSource, selector));

  const heroCheck = {
    key: 'hero',
    declared: true,
    matched: heroMatched,
    selectors: ['#heroDate', '#heroGroom', '#heroBride', '.hero', '.hero__content'],
  };

  sectionChecks.unshift(heroCheck);

  if (!heroMatched) {
    issues.push({
      level: 'warning',
      code: 'hero-not-detected',
      message: `Hero section was not detected inside ${manifest.slug}.`,
      section: 'hero',
    });
  }

  return { issues, sectionChecks };
}

function getFeatureDiagnostics(manifest, templateSource) {
  const normalizedSource = normalizeForSearch(templateSource);
  const featureChecks = {
    opening: OPENING_MARKERS.some((marker) => normalizedSource.includes(marker)),
    rsvpApi: normalizedSource.includes('/api/rsvp'),
    calendarLink:
      normalizedSource.includes('calendar-section')
      || normalizedSource.includes('da3wa-cal')
      || normalizedSource.includes('google calendar')
      || normalizedSource.includes('ics'),
    galleryMarkup:
      normalizedSource.includes('gallery-section')
      || normalizedSource.includes('gallerygrid')
      || normalizedSource.includes('da3wa-mem'),
    countdownMarkup:
      normalizedSource.includes('countdown-section')
      || normalizedSource.includes('id="countdown"')
      || normalizedSource.includes("id='countdown'")
      || normalizedSource.includes('farha-dynamic-countdown'),
  };

  const issues = [];

  if (!featureChecks.opening) {
    issues.push({
      level: 'warning',
      code: 'opening-not-detected',
      message: `Opening markers were not detected inside ${manifest.slug}.`,
    });
  }

  if (manifest.capabilities.supportsRsvp && !featureChecks.rsvpApi) {
    issues.push({
      level: 'warning',
      code: 'rsvp-api-not-detected',
      message: `RSVP submit flow was not detected inside ${manifest.slug}.`,
    });
  }

  if (manifest.capabilities.supportsGallery && !featureChecks.galleryMarkup) {
    issues.push({
      level: 'warning',
      code: 'gallery-not-detected',
      message: `Gallery markup was not detected inside ${manifest.slug}.`,
    });
  }

  return { issues, featureChecks };
}

function getFileDiagnostics(manifest, inventory) {
  const issues = [];

  if (!inventory.exists) {
    issues.push({
      level: 'error',
      code: 'missing-template-directory',
      message: `Template directory was not found for ${manifest.slug}.`,
      path: inventory.templateRoot,
    });
    return issues;
  }

  if (!inventory.indexHtml) {
    issues.push({
      level: 'error',
      code: 'missing-index-html',
      message: `Template ${manifest.slug} is missing index.html.`,
    });
  }

  if (inventory.scriptFiles.length === 0) {
    issues.push({
      level: 'warning',
      code: 'missing-script-file',
      message: `Template ${manifest.slug} does not expose a script.js/main.js runtime file.`,
    });
  }

  if (inventory.styleFiles.length === 0 && manifest.sourceType === 'structured-static') {
    issues.push({
      level: 'warning',
      code: 'missing-style-file',
      message: `Structured template ${manifest.slug} does not expose a style.css/styles.css file.`,
    });
  }

  if (!fileExists(manifest.previewImage)) {
    issues.push({
      level: 'warning',
      code: 'missing-preview-image',
      message: `Preview image was not found for ${manifest.slug}: ${manifest.previewImage || 'missing path'}`,
    });
  }

  return issues;
}

function buildCompletenessSummary(manifest, inventory, fieldChecks, sectionChecks, featureChecks) {
  const editableWithSelectors = fieldChecks.filter((item) => item.hasSelector);
  const editableMatched = editableWithSelectors.filter((item) => item.matched);
  const sectionsMatched = sectionChecks.filter((item) => item.matched);
  const featuresTotal = Object.keys(featureChecks).length;
  const featuresMatched = Object.values(featureChecks).filter(Boolean).length;

  return {
    files: {
      hasTemplateDirectory: inventory.exists,
      hasIndexHtml: Boolean(inventory.indexHtml),
      hasRuntimeScript: inventory.scriptFiles.length > 0,
      hasStylesheet: inventory.styleFiles.length > 0,
      hasPreviewImage: fileExists(manifest.previewImage),
      totalFiles: inventory.relativeFiles.length,
    },
    editableFields: {
      total: fieldChecks.length,
      withSelector: editableWithSelectors.length,
      matched: editableMatched.length,
      unmatched: editableWithSelectors.length - editableMatched.length,
      missingSelector: fieldChecks.length - editableWithSelectors.length,
    },
    sections: {
      total: sectionChecks.length,
      matched: sectionsMatched.length,
      unmatched: sectionChecks.length - sectionsMatched.length,
      missingKeys: sectionChecks.filter((item) => !item.matched).map((item) => item.key),
    },
    features: {
      total: featuresTotal,
      matched: featuresMatched,
      unmatched: featuresTotal - featuresMatched,
      checks: featureChecks,
    },
    readiness: {
      sourceType: manifest.sourceType,
      supportsSchemaDrivenPreview: manifest.capabilities.supportsSchemaDrivenPreview,
      requiresNativeAdapter: manifest.capabilities.requiresNativeAdapter,
      studioReadyFlag: manifest.capabilities.studioReady !== false,
    },
  };
}

export function getTemplateDiagnostics(slug) {
  const manifest = getTemplateManifest(slug);

  if (!manifest) {
    return {
      slug,
      status: 'error',
      summary: null,
      issues: [
        {
          level: 'error',
          code: 'missing-manifest',
          message: `No manifest registered for ${slug}.`,
        },
      ],
    };
  }

  const issues = [];
  const parseResult = validateTemplateManifest(manifest);

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

  const inventory = getTemplateFileInventory(slug);
  issues.push(...getFileDiagnostics(manifest, inventory));

  const templateSource = [
    readUtf8IfExists(inventory.indexHtml),
    ...inventory.scriptFiles.map((filePath) => readUtf8IfExists(filePath)),
    ...inventory.styleFiles.map((filePath) => readUtf8IfExists(filePath)),
  ].join('\n');

  const bindingDiagnostics = getBindingDiagnostics(manifest, templateSource);
  issues.push(...bindingDiagnostics.issues);

  const sectionDiagnostics = getSectionDiagnostics(manifest, templateSource);
  issues.push(...sectionDiagnostics.issues);

  const featureDiagnostics = getFeatureDiagnostics(manifest, templateSource);
  issues.push(...featureDiagnostics.issues);

  const summary = buildCompletenessSummary(
    manifest,
    inventory,
    bindingDiagnostics.fieldChecks,
    sectionDiagnostics.sectionChecks,
    featureDiagnostics.featureChecks,
  );

  return {
    slug,
    status: issues.some((issue) => issue.level === 'error')
      ? 'error'
      : issues.length > 0
        ? 'warning'
        : 'ok',
    summary,
    inventory: {
      templateRoot: inventory.templateRoot,
      relativeFiles: inventory.relativeFiles,
      indexHtml: inventory.indexHtml ? path.relative(process.cwd(), inventory.indexHtml).replace(/\\/g, '/') : null,
      scriptFiles: inventory.scriptFiles.map((filePath) => path.relative(process.cwd(), filePath).replace(/\\/g, '/')),
      styleFiles: inventory.styleFiles.map((filePath) => path.relative(process.cwd(), filePath).replace(/\\/g, '/')),
    },
    checks: {
      editableFields: bindingDiagnostics.fieldChecks,
      sections: sectionDiagnostics.sectionChecks,
      features: featureDiagnostics.featureChecks,
    },
    issues,
  };
}

export function getAllTemplateDiagnostics() {
  return getAllTemplateManifests().map((manifest) => getTemplateDiagnostics(manifest.slug));
}

export function getLaunchableTemplateManifests() {
  const diagnosticsMap = new Map(
    getAllTemplateDiagnostics().map((item) => [item.slug, item.status]),
  );

  return getAllTemplateManifests().filter((manifest) => diagnosticsMap.get(manifest.slug) === 'ok');
}
