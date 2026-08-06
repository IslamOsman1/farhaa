import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac']);
const FONT_EXTENSIONS = new Set(['.woff', '.woff2', '.ttf', '.otf']);
const CODE_EXTENSIONS = new Set(['.html', '.css', '.js']);
const TEMPLATE_SLUGS = [
  'jathuandthanu',
  'royal',
  'majestic',
  'twilight',
  'imperial',
  'toscana',
  'sacredgarden',
  'blossomoud',
  'dolcevita',
  'destinationlove',
  'classic',
  'bab',
  'reverie',
  'ring',
  'letter',
  'disney',
  'rozana',
  'hadeel',
  'wisal',
  'vangogh',
  'blush',
];

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

function classifyFile(extension) {
  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (FONT_EXTENSIONS.has(extension)) return 'font';
  if (CODE_EXTENSIONS.has(extension)) return 'code';
  return 'file';
}

const publicRoot = path.join(process.cwd(), 'public');
const files = walkDirectory(publicRoot).map((file) => {
  const [firstSegment] = file.relativePath.split(path.sep);
  return {
    ...file,
    kind: classifyFile(file.extension),
    templateSlug: TEMPLATE_SLUGS.includes(firstSegment) ? firstSegment : null,
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    templates: TEMPLATE_SLUGS.length,
    images: files.filter((file) => file.kind === 'image').length,
    videos: files.filter((file) => file.kind === 'video').length,
    audio: files.filter((file) => file.kind === 'audio').length,
    fonts: files.filter((file) => file.kind === 'font').length,
    codeFiles: files.filter((file) => file.kind === 'code').length,
    totalFiles: files.length,
  },
  templates: TEMPLATE_SLUGS.map((slug) => {
    const templateFiles = files.filter((file) => file.templateSlug === slug);
    return {
      slug,
      filesCount: templateFiles.length,
      imageCount: templateFiles.filter((file) => file.kind === 'image').length,
      videoCount: templateFiles.filter((file) => file.kind === 'video').length,
      audioCount: templateFiles.filter((file) => file.kind === 'audio').length,
      hasIndex: templateFiles.some((file) => file.relativePath === `${slug}${path.sep}index.html`),
    };
  }),
};

console.log(JSON.stringify(report, null, 2));
