import { getPrisma } from '../core/database.js';
import { settings } from '../core/config.js';
import type { Document } from '@prisma/client';
import type { DocumentMetadata } from '../models/document.js';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseStringPromise } from 'xml2js';

/**
 * Calculate MD5 hash
 */
function calculateMD5(content: Buffer): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Extract metadata from ENI XML
 */
async function extractXMLMetadata(xmlContent: string): Promise<DocumentMetadata> {
  try {
    const result = await parseStringPromise(xmlContent);
    const metadata: DocumentMetadata = {};

    // Navigate ENI XML structure
    const metadatos = result?.['eniDoc:documento']?.['eniDoc:metadatos']?.[0];
    
    if (metadatos) {
      // Extract common ENI fields
      if (metadatos['eniDoc:Identificador']?.[0]) {
        metadata.Identificador = metadatos['eniDoc:Identificador'][0];
      }
      if (metadatos['eniDoc:Organo']?.[0]) {
        metadata.Organo = metadatos['eniDoc:Organo'][0];
      }
      if (metadatos['eniDoc:FechaCaptura']?.[0]) {
        metadata.FechaCaptura = metadatos['eniDoc:FechaCaptura'][0];
      }
      if (metadatos['eniDoc:TipoDocumental']?.[0]) {
        metadata.TipoDocumental = metadatos['eniDoc:TipoDocumental'][0];
      }
      if (metadatos['eniDoc:EstadoElaboracion']?.[0]) {
        metadata.EstadoElaboracion = metadatos['eniDoc:EstadoElaboracion'][0];
      }
    }

    return metadata;
  } catch (error) {
    console.error('Error parsing XML:', error);
    return {};
  }
}

/**
 * Save file to storage
 */
async function saveFile(filename: string, content: Buffer): Promise<string> {
  await fs.mkdir(settings.storagePath, { recursive: true });
  const filePath = path.join(settings.storagePath, filename);
  await fs.writeFile(filePath, content);
  return filePath;
}

/**
 * Get or create metadata record
 */
async function getOrCreateMetadata(metadataName: string): Promise<number> {
  const prisma = getPrisma();
  
  let metadata = await prisma.metadata.findUnique({
    where: { metadataName }
  });

  metadata ??= await prisma.metadata.create({
    data: { metadataName }
  });

  return metadata.id;
}

/**
 * Create document with metadata extraction
 */
export async function createDocument(
  assetId: number,
  filename: string,
  content: Buffer
): Promise<Document> {
  const prisma = getPrisma();
  
  const md5Hash = calculateMD5(content);
  const filePath = await saveFile(filename, content);
  
  const xmlContent = content.toString('utf-8');
  const metadataDict = await extractXMLMetadata(xmlContent);
  
  const docId = metadataDict.Identificador || crypto.randomUUID();

  try {
    // Check if document exists
    const existing = await prisma.document.findUnique({
      where: { id: docId }
    });

    let document: Document;

    if (existing) {
      if (existing.assetId !== assetId) {
        throw new Error(`Document '${docId}' already exists in asset ${existing.assetId}`);
      }

      // Update existing document
      document = await prisma.document.update({
        where: { id: docId },
        data: {
          fileName: filename,
          md5: md5Hash,
          storagePath: filePath,
        }
      });

      // Delete old values
      await prisma.value.deleteMany({
        where: { idDocument: docId }
      });
    } else {
      // Create new document
      document = await prisma.document.create({
        data: {
          id: docId,
          assetId,
          fileName: filename,
          md5: md5Hash,
          storagePath: filePath,
        }
      });
    }

    // Add metadata values
    for (const [key, value] of Object.entries(metadataDict)) {
      const metadataId = await getOrCreateMetadata(key);
      await prisma.value.create({
        data: {
          idMetadata: metadataId,
          idDocument: docId,
          value: value,
        }
      });
    }

    return document;
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error(`Document with ID '${docId}' already exists`);
    }
    throw error;
  }
}

/**
 * Query documents with filters
 */
export async function queryDocuments(
  assetId: number,
  filters: Record<string, string> = {}
): Promise<Document[]> {
  const prisma = getPrisma();

  const where: any = { assetId };

  if (filters.file_name) {
    where.fileName = { contains: filters.file_name, mode: 'insensitive' };
  }

  // For metadata filters, we need to use a subquery
  const metadataFilters = Object.entries(filters).filter(([key]) => key !== 'file_name');
  
  if (metadataFilters.length > 0 && metadataFilters[0]) {
    const [metadataKey, metadataValue] = metadataFilters[0];
    
    const valueRecords = await prisma.value.findMany({
      where: {
        metadata: { metadataName: metadataKey },
        value: { contains: metadataValue, mode: 'insensitive' }
      },
      select: { idDocument: true }
    });

    const docIds = valueRecords.map(v => v.idDocument);
    where.id = { in: docIds };
  }

  return await prisma.document.findMany({ where });
}

/**
 * Get document with metadata
 */
export async function getDocumentWithMetadata(
  assetId: number,
  docId: string
): Promise<any> {
  const prisma = getPrisma();

  const document = await prisma.document.findFirst({
    where: { id: docId, assetId }
  });

  if (!document) {
    return null;
  }

  const values = await prisma.value.findMany({
    where: { idDocument: docId },
    include: { metadata: true }
  });

  const metadata: Record<string, string> = {};
  for (const value of values) {
    metadata[value.metadata.metadataName] = value.value || '';
  }

  return {
    id: document.id,
    assetId: document.assetId,
    fileName: document.fileName,
    md5: document.md5,
    storagePath: document.storagePath,
    metadata,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

/**
 * Delete document
 */
export async function deleteDocument(assetId: number, docId: string): Promise<boolean> {
  const prisma = getPrisma();

  const document = await prisma.document.findFirst({
    where: { id: docId, assetId }
  });

  if (!document) {
    return false;
  }

  // Delete file from storage
  try {
    await fs.unlink(document.storagePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  // Delete values first (foreign key constraint)
  await prisma.value.deleteMany({
    where: { idDocument: docId }
  });

  // Delete document
  await prisma.document.delete({
    where: { id: docId }
  });

  return true;
}