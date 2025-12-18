# Prisma 7 Migration Guide

This guide documents the complete migration process from Prisma 6 to Prisma 7, including all edge cases and breaking points encountered in our AI Customer Support project.

## Prerequisites Check

Before starting, verify your environment meets these requirements:

- **Node.js**: Minimum v20.19.0 (Recommended: v22.x)
- **TypeScript**: Minimum v5.4.0 (Recommended: v5.9.x)
- **Database**: PostgreSQL (MongoDB not yet supported in v7)

```bash
node --version  # Should be ≥20.19.0
npx tsc --version  # Should be ≥5.4.0
```

## Step 1: Install Required Packages

### Install New Dependencies

```bash
# Install environment variable loader
npm install dotenv

# Install PostgreSQL adapter (required for all databases in v7)
npm install @prisma/adapter-pg
```

### Upgrade Prisma Packages

```bash
# Upgrade to Prisma v7
npm install @prisma/client@7
npm install -D prisma@7
```

**⚠️ Important**: Both packages must be upgraded together to avoid version conflicts.

## Step 2: Update Prisma Schema

### 2.1 Update Generator Configuration

**Before:**
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}
```

**After:**
```prisma
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
  previewFeatures = ["postgresqlExtensions"]
}
```

**🚨 Breaking Point**: The `output` path is now **required** in Prisma 7. Without it, generation will fail with:
```
Error: An output path is required for the `prisma-client` generator
```

### 2.2 Update Datasource Block

**Before:**
```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [uuid_ossp(map: "uuid-ossp", schema: "extensions"), vector]
}
```

**After:**
```prisma
datasource db {
  provider   = "postgresql"
  extensions = [uuid_ossp(map: "uuid-ossp", schema: "extensions"), vector]
}
```

**🚨 Breaking Point**: The `url` and `directUrl` fields are no longer supported in schema files. They must be moved to `prisma.config.ts`.

## Step 3: Create Prisma Configuration File

Create `prisma.config.ts` in your project root:

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // Schema location
  schema: 'prisma/schema.prisma',
  
  // Migration settings
  migrations: {
    path: 'prisma/migrations',
  },
  
  // Database configuration
  datasource: {
    // Use DIRECT_URL for migrations as per v7 documentation
    url: env('DIRECT_URL'),
  },
})
```

**⚠️ Edge Case**: If you were using `directUrl` for migrations, use that value in the `url` field of the config file, not `DATABASE_URL`.

## Step 4: Enable ES Module Support

### 4.1 Update package.json

Add the `type` field:

```json
{
  "name": "your-project",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    // ... your existing scripts
  }
}
```

### 4.2 Update TypeScript Configuration

Modify `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",        // Updated from ES2017
    "module": "ESNext",        // Updated from esnext
    "moduleResolution": "bundler",  // Changed from "node"
    "esModuleInterop": true,
    "strict": true,
    // ... other existing options
  }
}
```

**🚨 Breaking Point**: Using `"moduleResolution": "node"` will cause build failures with import resolution errors. Must use `"bundler"` for Next.js projects.

## Step 5: Update Client Instantiation

### 5.1 Update Prisma Client File

**Before:**
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**After:**
```typescript
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL!
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**🚨 Breaking Points**:

1. **Import Path**: The import path changes from `'@prisma/client'` to the generated client location
2. **Adapter Required**: All database connections now require a driver adapter
3. **Connection String**: Pass the connection string to the adapter, not the PrismaClient constructor

## Step 6: Generate and Test

### 6.1 Generate Client

```bash
npx prisma generate
```

**Expected Output:**
```
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma
✔ Generated Prisma Client (7.0.1) to .\src\generated\prisma in 259ms
```

### 6.2 Test Build

```bash
npm run build
```

**🚨 Common Build Errors and Solutions:**

#### Error 1: Module Resolution
```
Module not found: Can't resolve './internal/class.js'
```
**Solution**: Ensure `tsconfig.json` uses `"moduleResolution": "bundler"`

#### Error 2: Config Property Error
```
'directUrl' does not exist in type '{ url: string; shadowDatabaseUrl?: string | undefined; }'
```
**Solution**: Remove `directUrl` from `prisma.config.ts` or use only `url` field

#### Error 3: Import Path Error
```
Module not found: Can't resolve '../generated/prisma/client'
```
**Solution**: Verify the correct relative path to the generated client

### 6.3 Test Development Server

```bash
npm run dev
```

### 6.4 Verify Database Connection

```bash
npx prisma studio
```

## Edge Cases and Solutions

### Edge Case 1: Custom Output Directory
If you have a custom output directory structure, ensure the import path in your Prisma client file matches the actual generated location.

### Edge Case 2: Monorepo Setup
In monorepos, place the `prisma.config.ts` file at the package level where your `package.json` is located, not at the monorepo root.

### Edge Case 3: Environment Variables
Prisma 7 doesn't auto-load environment variables. Ensure you have:
1. `import 'dotenv/config'` at the top of `prisma.config.ts`
2. `dotenv` package installed

### Edge Case 4: Different Database Adapters
For other databases:

**SQLite:**
```typescript
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
});
```

**MySQL:**
```typescript
import { PrismaMySQL } from '@prisma/adapter-mysql2';

const adapter = new PrismaMySQL({
  connectionString: process.env.DATABASE_URL
});
```

## Removed Features

### 1. Client Middleware (❌ Removed)
**Old:**
```typescript
prisma.$use(async (params, next) => {
  // middleware logic
  return next(params)
})
```

**New Alternative:**
```typescript
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async findMany({ args, query }) {
        // extension logic
        return query(args)
      }
    }
  }
})
```

### 2. Metrics Preview Feature (❌ Removed)
Use Client Extensions or the underlying driver adapter for metrics.

## Verification Checklist

- [ ] Node.js ≥20.19.0
- [ ] TypeScript ≥5.4.0
- [ ] Packages upgraded to v7
- [ ] Generator updated to `"prisma-client"`
- [ ] Output path specified in generator
- [ ] URL fields removed from schema
- [ ] `prisma.config.ts` created
- [ ] `"type": "module"` added to package.json
- [ ] TypeScript config updated for ESM
- [ ] Client imports updated
- [ ] Database adapter configured
- [ ] `dotenv` installed and imported
- [ ] Build successful
- [ ] Dev server working
- [ ] Database connection verified

## Benefits After Migration

✅ **Performance**: Faster queries and smaller bundle size
✅ **Modern**: ES module support
✅ **Efficient**: Lower resource usage
✅ **Type-Safe**: Full TypeScript support maintained
✅ **Future-Proof**: Ready for upcoming Prisma features

## Rollback Plan

If you need to rollback:

1. Revert package versions: `npm install @prisma/client@6 prisma@6 -D`
2. Restore original schema file
3. Remove `prisma.config.ts`
4. Remove `"type": "module"` from package.json
5. Revert TypeScript configuration
6. Restore original client instantiation
7. Run `npma prisma generate`

## Additional Resources

- [Official Prisma 7 Migration Guide](https://www.prisma.io/docs/getting-started/setup-prisma/upgrade-to-prisma-7)
- [Driver Adapters Documentation](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
- [ES Modules Guide](https://nodejs.org/api/esm.html)

---

**Note**: This migration was successfully completed for our AI Customer Support project running Next.js 15.5.2 with PostgreSQL and vector extensions.