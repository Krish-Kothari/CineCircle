const prisma = require('../../config/prisma');

const include = {
  streamingOptions: { select: { platform: true, region: true } }
};

// Krish's mobile app reads both item.streamingOptions and item.platforms
function withPlatforms(item) {
  return { ...item, platforms: item.streamingOptions.map((s) => s.platform) };
}

async function listCatalog({ search, platform, genre, type, page, limit }) {
  const take = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);

  const where = {};
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (type) where.type = type;
  if (genre) where.genres = { has: genre };
  if (platform) {
    where.streamingOptions = {
      some: { platform: { equals: platform, mode: 'insensitive' } }
    };
  }

  const [total, items] = await Promise.all([
    prisma.mediaItem.count({ where }),
    prisma.mediaItem.findMany({
      where,
      include,
      orderBy: [{ avgRating: 'desc' }, { title: 'asc' }],
      skip: (currentPage - 1) * take,
      take
    })
  ]);

  return {
    items: items.map(withPlatforms),
    pagination: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  };
}

async function getMediaById(id) {
  const item = await prisma.mediaItem.findUnique({ where: { id }, include });
  return item ? withPlatforms(item) : null;
}

async function listPlatforms() {
  const rows = await prisma.streamingOption.findMany({
    distinct: ['platform'],
    select: { platform: true },
    orderBy: { platform: 'asc' }
  });
  return rows.map((r) => r.platform);
}

module.exports = { listCatalog, getMediaById, listPlatforms };
