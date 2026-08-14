import fs from 'fs';
import path from 'path';
import { getAllTemplateManifests, OPENING_LIBRARY } from '@/lib/template-system';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac']);
const FONT_EXTENSIONS = new Set(['.woff', '.woff2', '.ttf', '.otf']);
const CODE_EXTENSIONS = new Set(['.html', '.css', '.js']);

function normalizePublicPath(relativePath) {
  return `/${relativePath.replace(/\\/g, '/')}`;
}

function walkDirectory(directoryPath, rootPath = directoryPath, bucket = []) {
  if (!fs.existsSync(directoryPath)) {
    return bucket;
  }

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const absolutePath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(absolutePath, rootPath, bucket);
      continue;
    }

    const relativePath = path.relative(rootPath, absolutePath);
    const extension = path.extname(entry.name).toLowerCase();
    const stats = fs.statSync(absolutePath);
    bucket.push({
      absolutePath,
      relativePath,
      publicPath: normalizePublicPath(relativePath),
      fileName: entry.name,
      extension,
      sizeBytes: stats.size,
      modifiedAt: stats.mtime.toISOString(),
    });
  }

  return bucket;
}

function classifyFile(file) {
  if (IMAGE_EXTENSIONS.has(file.extension)) return 'image';
  if (VIDEO_EXTENSIONS.has(file.extension)) return 'video';
  if (AUDIO_EXTENSIONS.has(file.extension)) return 'audio';
  if (FONT_EXTENSIONS.has(file.extension)) return 'font';
  if (CODE_EXTENSIONS.has(file.extension)) return 'code';
  return 'file';
}

export function scanTemplateStudioInventory(options = {}) {
  const openingsSource = Array.isArray(options.openings) && options.openings.length ? options.openings : OPENING_LIBRARY;
  const publicRoot = path.join(process.cwd(), 'public');
  const files = walkDirectory(publicRoot);
  const manifests = getAllTemplateManifests();
  const templateSlugs = new Set(manifests.map((manifest) => manifest.slug));

  const typedFiles = files.map((file) => ({
    ...file,
    kind: classifyFile(file),
    templateSlug: (() => {
      const [firstSegment] = file.relativePath.split(path.sep);
      return templateSlugs.has(firstSegment) ? firstSegment : null;
    })(),
  }));

  const images = typedFiles.filter((file) => file.kind === 'image');
  const videos = typedFiles.filter((file) => file.kind === 'video');
  const audio = typedFiles.filter((file) => file.kind === 'audio');
  const fonts = typedFiles.filter((file) => file.kind === 'font');
  const codeFiles = typedFiles.filter((file) => file.kind === 'code');

  const templates = manifests.map((manifest) => {
    const templateFiles = typedFiles.filter((file) => file.templateSlug === manifest.slug);
    const imageCount = templateFiles.filter((file) => file.kind === 'image').length;
    const videoCount = templateFiles.filter((file) => file.kind === 'video').length;
    const audioCount = templateFiles.filter((file) => file.kind === 'audio').length;
    const hasIndex = templateFiles.some((file) => file.relativePath === `${manifest.slug}${path.sep}index.html`);

    return {
      slug: manifest.slug,
      name: manifest.name,
      nameAr: manifest.nameAr,
      sourceType: manifest.sourceType,
      previewImage: manifest.previewImage,
      supportsVideo: videoCount > 0,
      supportsOpening: (manifest.openingCompatibility || []).length > 0,
      sectionsCount: (manifest.sections || []).length,
      editableFieldsCount: (manifest.editableFields || []).length,
      imageCount,
      videoCount,
      audioCount,
      filesCount: templateFiles.length,
      hasIndex,
      files: templateFiles,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      templates: templates.length,
      images: images.length,
      videos: videos.length,
      audio: audio.length,
      fonts: fonts.length,
      codeFiles: codeFiles.length,
      openings: openingsSource.length,
    },
    templates,
    openings: openingsSource.map((opening) => ({
      slug: opening.slug,
      name: opening.name,
      nameAr: opening.nameAr,
      type: opening.type,
      thumbnail: opening.thumbnail,
      compatibleTemplates:
        opening.compatibilityRules?.allowedTemplateSlugs || 'all',
      defaultConfig: opening.defaultConfig || {},
    })),
    media: {
      images,
      videos,
      audio,
      fonts,
      files: typedFiles,
    },
  };
}
