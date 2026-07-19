import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

function getArgValue(name) {
  const prefix = `--${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

function hasFlag(name) {
  return process.argv.slice(2).includes(`--${name}`);
}

function normalizeBaseUrl(raw) {
  if (!raw) return '';
  return raw.replace(/\/+$/, '');
}

function encodeObjectKey(key) {
  return key.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function buildUrl(baseUrl, key) {
  return `${baseUrl}/${encodeObjectKey(key)}`;
}

function summarize(label, updates) {
  console.log(`${label}: ${updates.length}`);
  for (const sample of updates.slice(0, 3)) {
    console.log(`  - ${sample.id}: ${sample.from || '(empty)'} -> ${sample.to}`);
  }
}

async function main() {
  const apply = hasFlag('apply');
  const publicUrlBase = normalizeBaseUrl(
    getArgValue('base') ||
      process.env.MEDIA_URL
  );

  if (!publicUrlBase) {
    throw new Error(
      'Missing public URL base. Pass --base=/media or set MEDIA_URL.'
    );
  }

  const [properties, propertyImages, units, unitImages, maintenanceRequests] = await Promise.all([
    prisma.property.findMany({
      where: { heroImageKey: { not: null } },
      select: { id: true, heroImageUrl: true, heroImageKey: true },
    }),
    prisma.propertyImage.findMany({
      where: { storageKey: { not: null } },
      select: { id: true, url: true, storageKey: true },
    }),
    prisma.unit.findMany({
      where: { coverImageKey: { not: null } },
      select: { id: true, coverImage: true, coverImageKey: true },
    }),
    prisma.unitImage.findMany({
      where: { storageKey: { not: null } },
      select: { id: true, url: true, storageKey: true },
    }),
    prisma.maintenanceRequest.findMany({
      where: {
        OR: [
          { attachmentKey: { not: null } },
          { commentAttachmentKey: { not: null } },
        ],
      },
      select: {
        id: true,
        attachmentUrl: true,
        attachmentKey: true,
        commentAttachmentUrl: true,
        commentAttachmentKey: true,
      },
    }),
  ]);

  const propertyUpdates = properties
    .map((row) => {
      const to = buildUrl(publicUrlBase, row.heroImageKey);
      return row.heroImageUrl === to ? null : { id: row.id, from: row.heroImageUrl, to };
    })
    .filter(Boolean);

  const propertyImageUpdates = propertyImages
    .map((row) => {
      const to = buildUrl(publicUrlBase, row.storageKey);
      return row.url === to ? null : { id: row.id, from: row.url, to };
    })
    .filter(Boolean);

  const unitUpdates = units
    .map((row) => {
      const to = buildUrl(publicUrlBase, row.coverImageKey);
      return row.coverImage === to ? null : { id: row.id, from: row.coverImage, to };
    })
    .filter(Boolean);

  const unitImageUpdates = unitImages
    .map((row) => {
      const to = buildUrl(publicUrlBase, row.storageKey);
      return row.url === to ? null : { id: row.id, from: row.url, to };
    })
    .filter(Boolean);

  const maintenanceAttachmentUpdates = maintenanceRequests
    .filter((row) => row.attachmentKey)
    .map((row) => {
      const to = buildUrl(publicUrlBase, row.attachmentKey);
      return row.attachmentUrl === to ? null : { id: row.id, from: row.attachmentUrl, to };
    })
    .filter(Boolean);

  const maintenanceCommentAttachmentUpdates = maintenanceRequests
    .filter((row) => row.commentAttachmentKey)
    .map((row) => {
      const to = buildUrl(publicUrlBase, row.commentAttachmentKey);
      return row.commentAttachmentUrl === to ? null : { id: row.id, from: row.commentAttachmentUrl, to };
    })
    .filter(Boolean);

  const total =
    propertyUpdates.length +
    propertyImageUpdates.length +
    unitUpdates.length +
    unitImageUpdates.length +
    maintenanceAttachmentUpdates.length +
    maintenanceCommentAttachmentUpdates.length;

  console.log(`Target public URL base: ${publicUrlBase}`);
  console.log(`Mode: ${apply ? 'apply' : 'dry-run'}`);
  summarize('Property.heroImageUrl', propertyUpdates);
  summarize('PropertyImage.url', propertyImageUpdates);
  summarize('Unit.coverImage', unitUpdates);
  summarize('UnitImage.url', unitImageUpdates);
  summarize('MaintenanceRequest.attachmentUrl', maintenanceAttachmentUpdates);
  summarize('MaintenanceRequest.commentAttachmentUrl', maintenanceCommentAttachmentUpdates);
  console.log(`Total URL updates needed: ${total}`);

  if (!apply) {
    console.log('');
    console.log('Dry run complete. After your objects are copied to MEDIA_ROOT, apply with:');
    console.log(`pnpm storage:rewrite-urls -- --base=${publicUrlBase} --apply`);
    return;
  }

  for (const update of propertyUpdates) {
    await prisma.property.update({
      where: { id: update.id },
      data: { heroImageUrl: update.to },
    });
  }

  for (const update of propertyImageUpdates) {
    await prisma.propertyImage.update({
      where: { id: update.id },
      data: { url: update.to },
    });
  }

  for (const update of unitUpdates) {
    await prisma.unit.update({
      where: { id: update.id },
      data: { coverImage: update.to },
    });
  }

  for (const update of unitImageUpdates) {
    await prisma.unitImage.update({
      where: { id: update.id },
      data: { url: update.to },
    });
  }

  for (const update of maintenanceAttachmentUpdates) {
    await prisma.maintenanceRequest.update({
      where: { id: update.id },
      data: { attachmentUrl: update.to },
    });
  }

  for (const update of maintenanceCommentAttachmentUpdates) {
    await prisma.maintenanceRequest.update({
      where: { id: update.id },
      data: { commentAttachmentUrl: update.to },
    });
  }

  console.log(`Applied ${total} URL updates.`);
}

main()
  .catch((error) => {
    console.error('[rewrite-storage-urls] Error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
