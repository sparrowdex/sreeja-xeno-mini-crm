import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
// @ts-ignore
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'
const dbPath = isProd ? '/tmp/dev.db' : path.join(process.cwd(), 'prisma/dev.db')

if (isProd) {
  const sourcePath = path.join(process.cwd(), 'prisma', 'dev.db')
  if (!fs.existsSync('/tmp/dev.db') && fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, '/tmp/dev.db')
  }
  if (fs.existsSync('/tmp/dev.db')) {
    try { fs.chmodSync('/tmp/dev.db', 0o666) } catch (e) {}
  }
}

// Ignore process.env.DATABASE_URL completely to prevent Vercel from overriding this!
// In Prisma 7, the adapter takes a config object with a url property, not a database instance.
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
