import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { settings } from './config.js';

let prisma: PrismaClient | null = null;

/**
 * Initialize Prisma Client with pg adapter (Prisma 7)
 */
export function initializeDatabase(): PrismaClient | null {
  if (!settings.enableDatabase) {
    console.log('⚠️  Database is DISABLED. Skipping Prisma setup.');
    return null;
  }

  if (!settings.databaseUrl) {
    throw new Error('Database URL is not configured properly');
  }

  console.log('📊 Database is ENABLED. Initializing Prisma Client with pg adapter...');

  try {
    const pool = new Pool({
      connectionString: settings.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    const adapter = new PrismaPg(pool);

    prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['warn', 'error'],
    });

    prisma.$connect()
      .then(() => {
        console.log('✅ Prisma connected to database successfully (Prisma 7)');
      })
      .catch((error) => {
        console.error('❌ Prisma connection failed:', error);
        throw error;
      });

    return prisma;
  } catch (error) {
    console.error('❌ Error initializing Prisma:', error);
    throw error;
  }
}

/**
 * Get Prisma Client instance
 */
export function getPrisma(): PrismaClient {
  if (!settings.enableDatabase) {
    throw new Error('Cannot get Prisma client because the database connection is disabled');
  }

  if (!prisma) {
    throw new Error('Prisma client not initialized. Call initializeDatabase() first');
  }

  return prisma;
}

/**
 * Close database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    console.log('📊 Prisma disconnected from database');
    prisma = null;
  }
}

/**
 * Health check - test database connection
 */
export async function testConnection(): Promise<boolean> {
  if (!prisma) return false;
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}