# CineCircle Database Deliverables (DBMS)

This folder documents and implements the CineCircle PostgreSQL database. The project uses the Prisma migration and seed scripts under `backend/prisma`, while Express services in `backend/src/modules` perform CRUD operations through `PrismaClient`.

## Deliverables

1. [Database selection and justification](01-database-selection.md)
2. [ER diagram and data model](02-er-diagram.md)
3. [Normalization analysis](03-normalization.md)
4. [Final schema and constraints](04-final-schema.md)
5. [Sample records](05-sample-records.sql)
6. [Project-specific SQL queries](06-project-queries.sql)
7. [Backend integration evidence](07-backend-integration.md)
8. [Architecture and performance considerations](08-architecture.md)
9. [Recorded query execution evidence](09-execution-output.md)

## Implementation locations

| Artifact | Repository location |
|---|---|
| Prisma data model | `backend/prisma/schema.prisma` |
| PostgreSQL migration | `backend/prisma/migrations/20261115052855_/migration.sql` |
| Sample database seed | `backend/prisma/seed/` |
| Express and Prisma integration | `backend/src/modules/`, `backend/src/config/prisma.js` |
| API routes | `backend/src/server.js`, `backend/src/modules/*/*.routes.js` |

## Quick verification

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run verify:db
npm test
```
