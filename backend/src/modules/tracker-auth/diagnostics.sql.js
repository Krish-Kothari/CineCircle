const prisma = require('../../config/prisma');

// KRISH DE VIVA SHOWCASE: Queries pg_stat_user_tables and pg_indexes to prove
// all 12 tables and custom B-Tree/GIN indexes are active in PostgreSQL during evaluation.
async function getDatabaseDiagnosticsSql() {
  const [tableStats, indexStats, dbVersion] = await Promise.all([
    prisma.$queryRaw`
      SELECT 
        relname AS table_name,
        n_live_tup::int AS live_rows,
        idx_scan::int AS index_scans,
        seq_scan::int AS sequential_scans
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC;
    `,
    prisma.$queryRaw`
      SELECT 
        tablename AS table_name,
        indexname AS index_name,
        indexdef AS index_definition
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename ASC, indexname ASC;
    `,
    prisma.$queryRaw`
      SELECT version() AS postgres_version, current_database() AS database_name;
    `
  ]);

  return {
    databaseInfo: dbVersion[0] || {},
    totalTables: tableStats.length,
    totalIndexes: indexStats.length,
    tableStats,
    indexStats
  };
}

module.exports = { getDatabaseDiagnosticsSql };
