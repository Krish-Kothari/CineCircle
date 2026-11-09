const prisma = require('../../src/config/prisma');

const CATALOG = [
  { title: 'Inception', type: 'MOVIE', releaseYear: 2010, runtimeMinutes: 148, genres: ['Sci-Fi', 'Thriller', 'Action'], synopsis: 'A thief who steals secrets through dreams is given a chance to plant an idea instead.', platforms: ['Netflix'] },
  { title: 'Interstellar', type: 'MOVIE', releaseYear: 2014, runtimeMinutes: 169, genres: ['Sci-Fi', 'Drama'], synopsis: 'Explorers travel through a wormhole to find a new home for humanity.', platforms: ['Prime Video'] },
  { title: 'The Dark Knight', type: 'MOVIE', releaseYear: 2008, runtimeMinutes: 152, genres: ['Action', 'Crime', 'Thriller'], synopsis: 'Batman faces the Joker, who pushes Gotham into chaos.', platforms: ['Netflix', 'Prime Video'] },
  { title: 'Parasite', type: 'MOVIE', releaseYear: 2019, runtimeMinutes: 132, genres: ['Thriller', 'Drama'], synopsis: 'A poor family slowly infiltrates the life of a wealthy household.', platforms: ['Prime Video'] },
  { title: '3 Idiots', type: 'MOVIE', releaseYear: 2009, runtimeMinutes: 170, genres: ['Comedy', 'Drama'], synopsis: 'Three engineering students question the pressure of rote learning and success.', platforms: ['Netflix', 'Prime Video'] },
  { title: 'Dangal', type: 'MOVIE', releaseYear: 2016, runtimeMinutes: 161, genres: ['Drama', 'Sport'], synopsis: 'A former wrestler trains his daughters to become world-class wrestlers.', platforms: ['Netflix'] },
  { title: 'Drishyam', type: 'MOVIE', releaseYear: 2015, runtimeMinutes: 163, genres: ['Thriller', 'Mystery', 'Drama'], synopsis: 'A man goes to extreme lengths to protect his family after a crime.', platforms: ['Prime Video'] },
  { title: 'Andhadhun', type: 'MOVIE', releaseYear: 2018, runtimeMinutes: 139, genres: ['Thriller', 'Mystery', 'Comedy'], synopsis: 'A pianist pretending to be blind gets pulled into a murder case.', platforms: ['Netflix'] },
  { title: 'Zindagi Na Milegi Dobara', type: 'MOVIE', releaseYear: 2011, runtimeMinutes: 155, genres: ['Drama', 'Comedy'], synopsis: 'Three friends take a bachelor road trip across Spain.', platforms: ['Netflix', 'Disney+ Hotstar'] },
  { title: 'Stranger Things', type: 'TV_SHOW', releaseYear: 2016, totalEpisodes: 42, genres: ['Sci-Fi', 'Mystery', 'Drama'], synopsis: 'Kids in a small town uncover secret experiments and a parallel dimension.', platforms: ['Netflix'] },
  { title: 'Breaking Bad', type: 'TV_SHOW', releaseYear: 2008, totalEpisodes: 62, genres: ['Crime', 'Drama', 'Thriller'], synopsis: 'A chemistry teacher turns to making drugs after a cancer diagnosis.', platforms: ['Netflix'] },
  { title: 'Money Heist', type: 'TV_SHOW', releaseYear: 2017, totalEpisodes: 41, genres: ['Crime', 'Thriller', 'Action'], synopsis: 'A mastermind leads a group of robbers in an elaborate heist.', platforms: ['Netflix'] },
  { title: 'Sacred Games', type: 'TV_SHOW', releaseYear: 2018, totalEpisodes: 16, genres: ['Crime', 'Thriller', 'Mystery'], synopsis: 'A police officer gets a tip about an impending disaster in Mumbai.', platforms: ['Netflix'] },
  { title: 'Mirzapur', type: 'TV_SHOW', releaseYear: 2018, totalEpisodes: 29, genres: ['Crime', 'Action', 'Drama'], synopsis: 'Power struggles in the lawless mafia world of Mirzapur.', platforms: ['Prime Video'] },
  { title: 'The Family Man', type: 'TV_SHOW', releaseYear: 2019, totalEpisodes: 26, genres: ['Action', 'Thriller', 'Comedy'], synopsis: 'A middle-class man secretly works as an intelligence officer.', platforms: ['Prime Video'] },
  { title: 'Dark', type: 'TV_SHOW', releaseYear: 2017, totalEpisodes: 26, genres: ['Sci-Fi', 'Mystery', 'Thriller'], synopsis: 'A missing child exposes a time-travel mystery across generations.', platforms: ['Netflix'] }
];

async function seedCatalog(db = prisma) {
  for (const item of CATALOG) {
    const { platforms, ...data } = item;

    let media = await db.mediaItem.findFirst({
      where: { title: data.title, type: data.type }
    });
    if (!media) {
      media = await db.mediaItem.create({ data });
    }

    await db.streamingOption.createMany({
      data: platforms.map((platform) => ({ mediaId: media.id, platform })),
      skipDuplicates: true
    });
  }
  console.log(`Catalog seeded: ${CATALOG.length} titles`);
}

module.exports = { seedCatalog };

if (require.main === module) {
  seedCatalog()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
