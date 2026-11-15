require('dotenv').config();

const prisma = require('../src/config/prisma');
const { listCatalog } = require('../src/modules/catalog-recs/catalog.service');

async function benchmark() {
  const startedAt = process.hrtime.bigint();
  const result = await listCatalog({ page: 1, limit: 20 });
  const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
  console.log(`Catalog query returned ${result.items.length} items in ${elapsedMs.toFixed(2)} ms`);
}

benchmark()
  .catch((error) => {
    console.error('Catalog benchmark failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
