import crypto from 'crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const mediaRoot = process.env.MEDIA_ROOT ||
  (process.env.NODE_ENV === 'production' ? '/app/media' : path.join(process.cwd(), 'media'));
const mediaUrl = process.env.MEDIA_URL || '/media/';

function encodeObjectKey(key: string){
  return key.split('/').map((segment)=> encodeURIComponent(segment)).join('/');
}

function buildMediaUrl(key: string){
  return `${mediaUrl.replace(/\/?$/, '/')}${encodeObjectKey(key)}`;
}

function sanitizePathSegment(value: string){
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sanitizePrefix(prefix: string){
  return prefix
    .split('/')
    .map((segment)=> sanitizePathSegment(segment))
    .filter(Boolean)
    .join('/');
}

function sanitizeFileName(name: string){
  return sanitizePathSegment(name) || 'upload';
}

function assertInsideMediaRoot(targetPath: string){
  const root = path.resolve(mediaRoot);
  const target = path.resolve(targetPath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)){
    throw new Error('Resolved media path is outside MEDIA_ROOT.');
  }
}

/**
 * Compress and optimize image before upload.
 */
async function optimizeFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!file.type.startsWith('image/')) {
    return buffer;
  }

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const maxDimension = 3840;
    const needsResize = metadata.width && metadata.height &&
      (metadata.width > maxDimension || metadata.height > maxDimension);

    let processedImage = image
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .withMetadata({});

    if (needsResize) {
      processedImage = processedImage.resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    return processedImage.toBuffer();
  } catch (error) {
    console.warn('Image optimization failed, saving original:', error);
    return buffer;
  }
}

export async function uploadFileToMedia(file: File, prefix: string){
  const safePrefix = sanitizePrefix(prefix);
  const originalName = file.name || 'upload';
  const safeName = sanitizeFileName(originalName);
  const baseName = file.type.startsWith('image/') ? safeName.replace(/\.[^.]+$/, '') : safeName;
  const fileName = file.type.startsWith('image/')
    ? `${Date.now()}-${crypto.randomUUID()}-${baseName}.jpg`
    : `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const key = [safePrefix, fileName].filter(Boolean).join('/');
  const targetPath = path.join(mediaRoot, key);

  assertInsideMediaRoot(targetPath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, await optimizeFile(file));

  return {
    url: buildMediaUrl(key),
    key,
  };
}

export async function deleteFileFromMedia(key: string){
  const targetPath = path.join(mediaRoot, key);
  assertInsideMediaRoot(targetPath);

  try {
    await unlink(targetPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}
