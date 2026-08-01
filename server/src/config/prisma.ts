import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

// A single shared PrismaClient instance. In dev, tsx's watch mode re-runs
// this module on every file change; stashing the client on `globalThis`
// prevents opening a fresh SQLite connection pool on every hot reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProduction ? ['error', 'warn'] : ['error', 'warn'],
  })

if (!env.isProduction) {
  globalForPrisma.prisma = prisma
}
