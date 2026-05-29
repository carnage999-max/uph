import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import sharp from 'sharp';

// Prefer UPH_ names for Amplify, but keep AWS_/generic S3 fallbacks for local use
// and S3-compatible providers such as R2 or B2.
const bucket = process.env.S3_BUCKET_NAME || process.env.UPH_S3_BUCKET;
const region = process.env.UPH_AWS_REGION || process.env.AWS_REGION;
const accessKeyId = process.env.UPH_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.UPH_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const endpoint = process.env.UPH_S3_ENDPOINT || process.env.S3_ENDPOINT;
const publicUrlBase = (process.env.UPH_S3_PUBLIC_URL_BASE || process.env.S3_PUBLIC_URL_BASE || '').replace(/\/+$/, '');
const forcePathStyle = /^(1|true|yes)$/i.test(
  process.env.UPH_S3_FORCE_PATH_STYLE || process.env.S3_FORCE_PATH_STYLE || ''
);

if (bucket && (!region || !accessKeyId || !secretAccessKey)){
  console.warn(
    'Storage credentials are incomplete. Uploads will fail until region, access key, secret key, and bucket are set.'
  );
}

if (endpoint && !publicUrlBase) {
  console.warn(
    'Custom S3 endpoint detected without S3_PUBLIC_URL_BASE/UPH_S3_PUBLIC_URL_BASE. Stored asset URLs may not be publicly reachable.'
  );
}

const s3Client = bucket && region && accessKeyId && secretAccessKey
  ? new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
      endpoint,
      forcePathStyle,
    })
  : null;

function encodeObjectKey(key: string){
  return key.split('/').map((segment)=> encodeURIComponent(segment)).join('/');
}

function buildObjectUrl(key: string){
  const encodedKey = encodeObjectKey(key);

  if (publicUrlBase) {
    return `${publicUrlBase}/${encodedKey}`;
  }

  if (endpoint) {
    const normalizedEndpoint = endpoint.replace(/\/+$/, '');
    if (forcePathStyle) {
      return `${normalizedEndpoint}/${bucket}/${encodedKey}`;
    }
    return `${normalizedEndpoint}/${encodedKey}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

function sanitizeFileName(name: string){
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Compress and optimize image before upload
 * - Converts to JPEG format for consistency
 * - Resizes if image is larger than 3840px on the longest side
 * - Compresses with quality 85 (good balance of size/quality)
 * - Strips EXIF data to reduce file size
 */
async function optimizeImage(file: File): Promise<{ buffer: Buffer; contentType: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Check if it's an image file
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    return { buffer, contentType: file.type || 'application/octet-stream' };
  }

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Max dimensions: 3840px on longest side (4K width, good for web)
    const maxDimension = 3840;
    const needsResize = metadata.width && metadata.height && 
                        (metadata.width > maxDimension || metadata.height > maxDimension);

    let processedImage = image
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .withMetadata({}); // Strip metadata (EXIF, etc.)

    if (needsResize) {
      processedImage = processedImage.resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const optimizedBuffer = await processedImage.toBuffer();
    
    return {
      buffer: optimizedBuffer,
      contentType: 'image/jpeg',
    };
  } catch (error) {
    // If optimization fails, return original file
    console.warn('Image optimization failed, uploading original:', error);
    return { buffer, contentType: file.type || 'application/octet-stream' };
  }
}

export async function uploadFileToS3(file: File, prefix: string){
  if (!s3Client || !bucket){
    throw new Error(
      'Storage client is not configured. Set bucket, region, access key, and secret key environment variables.'
    );
  }

  const originalName = file.name || 'upload';
  let safeName = sanitizeFileName(originalName);
  if (!safeName) safeName = 'upload';
  
  // Use .jpg extension for optimized images, keep original extension for non-images
  const ext = file.type.startsWith('image/') ? '.jpg' : '';
  const key = `${prefix}/${Date.now()}-${crypto.randomUUID()}-${safeName}${ext}`;
  
  // Optimize image if it's an image file
  const { buffer, contentType } = await optimizeImage(file);

  await s3Client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable', // Cache for 1 year
  }));

  return {
    url: buildObjectUrl(key),
    key,
  };
}

export async function deleteFileFromS3(key: string){
  if (!s3Client || !bucket){
    throw new Error('S3 client is not configured.');
  }

  await s3Client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  }));
}
