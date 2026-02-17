import express from 'express';
import type { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { settings } from './core/config.js';
import { 
  initializeDatabase, 
  closeDatabaseConnection, 
  testConnection 
} from './core/database.js';

// Import routers
import assetsRouter from './api/assets.js';
import workOrdersRouter from './api/workOrders.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **************************** DO NOT CHANGE ****************************

// Initialize database on startup
if (settings.enableDatabase) {
  initializeDatabase();
}

// Swagger Configuration
// Swagger Configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Asset Management API',
      version: '1.0.0',
      description: 'API for managing assets, documents, and work orders',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${settings.apiPort}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        AssetCreate: {
          type: 'object',
          required: ['prismaId', 'siteId'],
          properties: {
            prismaId: { type: 'string', example: '04BAL_001' },
            siteId: { type: 'integer', example: 2 },
            assetName: { type: 'string', example: 'BALIZA ASFA - Línea 1' },
            equipmentType: { type: 'string', example: '04BAL' },
            businessUnit: { type: 'string', example: '04' },
            companyLevel: { type: 'number', example: 8.0 },
            priority: { type: 'number', example: 99.0 },
            equipmentState: { type: 'string', example: 'OPERATIONAL' },
          },
        },
        Asset: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            prismaId: { type: 'string', example: '04BAL_001' },
            siteId: { type: 'integer', example: 2 },
            assetName: { type: 'string', example: 'BALIZA ASFA - Línea 1' },
            equipmentType: { type: 'string', example: '04BAL' },
            businessUnit: { type: 'string', example: '04' },
            parentAsset: { type: 'string', nullable: true },
            companyLevel: { type: 'number', example: 8.0 },
            priority: { type: 'number', example: 99.0 },
            equipmentState: { type: 'string', example: 'OPERATIONAL' },
            isLinearAsset: { type: 'boolean', nullable: true },
            recordState: { type: 'string', nullable: true },
            customIsTu: { type: 'boolean', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'DOC-12345-2024' },
            assetId: { type: 'integer', example: 1 },
            fileName: { type: 'string', example: 'document.xml' },
            md5: { type: 'string', example: 'a1b2c3d4e5f6g7h8i9j0' },
            storagePath: { type: 'string', example: '/storage/document.xml' },
            metadata: {
              type: 'object',
              additionalProperties: { type: 'string' },
              example: {
                Identificador: 'DOC-12345-2024',
                Organo: 'ORG-001',
                FechaCaptura: '2024-01-15',
                TipoDocumental: 'Technical Report',
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        WorkOrderCreate: {
          type: 'object',
          required: ['workOrder'],
          properties: {
            workOrder: { type: 'number', example: 12345 },
            workOrderName: { type: 'string', nullable: true },
            workOrderSource: { type: 'string', nullable: true },
            workOrderDate: { type: 'string', format: 'date-time', nullable: true },
            workOrderState: { type: 'string', nullable: true },
            workType: { type: 'string', nullable: true },
            priority: { type: 'string', nullable: true },
            closed: { type: 'boolean', nullable: true },
          },
        },
        WorkOrder: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            assetId: { type: 'integer', example: 1 },
            workOrder: { type: 'number', example: 12345 },
            workOrderName: { type: 'string', nullable: true },
            workOrderSource: { type: 'string', nullable: true },
            workOrderDate: { type: 'string', format: 'date-time', nullable: true },
            workOrderState: { type: 'string', nullable: true },
            workType: { type: 'string', nullable: true },
            priority: { type: 'string', nullable: true },
            closed: { type: 'boolean', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            detail: { type: 'string', example: 'Asset not found' },
          },
        },
      },
    },
  },
  apis: ['./src/api/*.ts', './src/index.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Asset Management API',
}));

app.get('/openapi.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service unhealthy
 */
app.get('/health', async (_req: Request, res: Response) => {
  if (!settings.enableDatabase) {
    res.json({
      status: 'healthy',
      database_status: 'disabled'
    });
    return;
  }

  const isConnected = await testConnection();
  
  if (isConnected) {
    res.json({
      status: 'healthy',
      database_status: 'connected'
    });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      database_status: 'disconnected',
      detail: 'Database connection is not healthy'
    });
  }
});

// **************************** DO NOT CHANGE ****************************

/**
 * ************** INCLUDE YOUR CUSTOM ROUTERS HERE ********************
 */

app.use('', assetsRouter);
app.use('', workOrdersRouter);

/**
 * ************** INCLUDE YOUR CUSTOM ROUTERS HERE ********************
 */

// **************************** DO NOT CHANGE ****************************

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

// Start server
const PORT = settings.apiPort;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/docs`);
  console.log(`📄 OpenAPI Spec: http://localhost:${PORT}/openapi.json`);
  console.log(`📊 Database: ${settings.enableDatabase ? 'ENABLED (Prisma)' : 'DISABLED'}`);
  if (settings.databaseUrl) {
    console.log(`🔗 Database URL: ${settings.databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
  }
});

// **************************** DO NOT CHANGE ****************************