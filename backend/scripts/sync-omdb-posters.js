require('dotenv').config();

const prisma = require('../src/config/prisma');
const { isPlaceholderPoster, syncPosterForMediaItem } = require('../src/modules/catalog-recs/poster-sync.service');

async function main() {
  const items = await prisma.mediaItem.findMany({
    select: { id: true, title: true, type: true, posterUrl: true },
    orderBy: { title: 'asc' }
  });

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    if (!isPlaceholderPoster(item.posterUrl)) {
      skipped += 1;
      continue;
    }

    try {
      const result = await syncPosterForMediaItem(item);
      if (result.updated) {
        updated += 1;
        console.log(`Updated ${item.type}: ${item.title}`);
      } else {
        skipped += 1;
        console.warn(`No OMDb poster found: ${item.title}`);
      }
    } catch (error) {
      failed += 1;
      console.error(`Failed ${item.type}: ${item.title} - ${error.message}`);
    }
  }

  console.log(`OMDb poster sync complete: ${updated} updated, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(`OMDb poster sync aborted: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
