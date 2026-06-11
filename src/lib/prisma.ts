import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import fs from 'fs'
import path from 'path'

// Vercel serverless functions are read-only except for the /tmp directory.
// For the prototype to work (writing webhooks/campaigns), we must copy the 
// seeded DB to /tmp on cold boot.
const isProd = process.env.NODE_ENV === 'production'
const dbPath = isProd ? '/tmp/dev.db' : path.join(process.cwd(), 'prisma/dev.db')

if (isProd && !fs.existsSync('/tmp/dev.db')) {
  const sourcePath = path.join(process.cwd(), 'prisma', 'dev.db')
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, '/tmp/dev.db')
  }
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || `file:${dbPath}`,
})

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
