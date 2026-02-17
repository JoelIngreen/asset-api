# Asset Management API

API REST para la gestión de activos, documentos XML y órdenes de trabajo.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [API Endpoints](#api-endpoints)
- [Documentación Swagger](#documentación-swagger)
- [Arquitectura](#arquitectura)
- [Base de Datos](#base-de-datos)
- [Manejo de Errores](#manejo-de-errores)

## ✨ Características

- 🏗️ **Gestión de Activos**: Crear, consultar y actualizar activos con soporte para jerarquías padre-hijo
- 📄 **Gestión de Documentos XML**: Upload, consulta y eliminación de documentos con extracción automática de metadatos ENI
- 📋 **Órdenes de Trabajo**: Gestión completa de work orders asociadas a activos
- 🔍 **Búsqueda Avanzada**: Filtrado por múltiples campos y paginación
- 📊 **OpenAPI/Swagger**: Documentación interactiva de la API
- 🗄️ **Prisma ORM**: Acceso type-safe a PostgreSQL con adaptador pg (Prisma 7)
- ✅ **Validación con Zod**: Schemas validados automáticamente

## 🔧 Requisitos Previos

- **Node.js**: v18 o superior
- **PostgreSQL**: v14 o superior (opcional, puede deshabilitarse)
- **npm** o **yarn**

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd asset-management-api

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate
```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
# API Configuration
API_PORT=20000

# Database Configuration
enable_database=1
postgres_user=your_user
postgres_password=your_password
postgres_host=localhost
postgres_port=5432
postgres_db=asset_db
schema_name=lake

# Storage Configuration
storage_path=./storage
```

### Variables de Entorno

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `API_PORT` | Puerto del servidor | `20000` | No |
| `enable_database` | Habilitar BD (`1` = sí, `0` = no) | - | Sí |
| `postgres_user` | Usuario PostgreSQL | - | Sí (si BD habilitada) |
| `postgres_password` | Contraseña PostgreSQL | - | Sí (si BD habilitada) |
| `postgres_host` | Host PostgreSQL | - | Sí (si BD habilitada) |
| `postgres_port` | Puerto PostgreSQL | `5432` | No |
| `postgres_db` | Nombre de la BD | - | Sí (si BD habilitada) |
| `schema_name` | Schema de PostgreSQL | `lake` | No |
| `storage_path` | Ruta de almacenamiento de archivos | `./storage` | No |

### Migración de Base de Datos

```bash
# Crear migración
npx prisma migrate dev --name init

# Aplicar migraciones en producción
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status
```

## 🚀 Ejecución

### Modo Desarrollo

```bash
npm run dev
```

### Modo Producción

```bash
# Compilar TypeScript
npm run build

# Ejecutar versión compilada
npm start
```

La API estará disponible en:
- **API**: http://localhost:20000
- **Swagger UI**: http://localhost:20000/docs
- **OpenAPI Spec**: http://localhost:20000/openapi.json
- **Health Check**: http://localhost:20000/health

## 📡 API Endpoints

### Assets

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/assets` | Crear un nuevo activo |
| `POST` | `/assets/upsert` | Crear o actualizar un activo |
| `GET` | `/assets` | Listar activos (con filtros y paginación) |
| `GET` | `/assets/:assetId` | Obtener activo por ID interno |
| `GET` | `/assets/by-prisma-id/:prismaId` | Obtener activo por Prisma ID |
| `GET` | `/assets/by-parent-prisma-id/:parentPrismaId` | Obtener hijos de un activo |

#### Ejemplo: Crear Asset

```bash
curl -X POST http://localhost:20000/assets \
  -H "Content-Type: application/json" \
  -d '{
    "prismaId": "ASSET-001",
    "siteId": 1,
    "assetName": "Bomba Principal",
    "equipmentType": "PUMP",
    "businessUnit": "Operations"
  }'
```

#### Ejemplo: Listar Assets con Filtros

```bash
curl "http://localhost:20000/assets?skip=0&limit=10&site_id=1&equipment_type=PUMP&sort_by=assetName&sort_order=asc"
```

### Documents

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/assets/:assetId/documents` | Subir documento XML |
| `POST` | `/assets/:assetId/documents/upsert` | Crear o actualizar documento XML |
| `GET` | `/assets/:assetId/documents` | Listar documentos (con filtros) |
| `GET` | `/assets/:assetId/documents/:docId` | Obtener documento específico |
| `DELETE` | `/assets/:assetId/documents/:docId` | Eliminar documento |

#### Ejemplo: Upload Documento XML

```bash
curl -X POST http://localhost:20000/assets/1/documents \
  -F "file=@document.xml"
```

#### Ejemplo: Consultar Documentos por Metadata

```bash
curl "http://localhost:20000/assets/1/documents?metadata_key=Organo&metadata_value=ORG-001"
```

### Work Orders

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/assets/:assetId/work_orders` | Crear orden de trabajo |
| `POST` | `/assets/by-prisma-id/:prismaId/work_orders` | Crear orden por Prisma ID |
| `POST` | `/assets/:assetId/work_orders/upsert` | Crear o actualizar orden |
| `GET` | `/assets/:assetId/work_orders` | Listar órdenes de trabajo |
| `GET` | `/assets/:assetId/work_orders/:workOrderId` | Obtener orden específica |
| `DELETE` | `/assets/:assetId/work_orders/:workOrderId` | Eliminar orden |

#### Ejemplo: Crear Work Order

```bash
curl -X POST http://localhost:20000/assets/1/work_orders \
  -H "Content-Type: application/json" \
  -d '{
    "workOrder": 12345,
    "workOrderName": "Mantenimiento Preventivo Q1",
    "workType": "PREVENTIVE",
    "priority": "HIGH"
  }'
```

## 📚 Documentación Swagger

Accede a la documentación interactiva en: **http://localhost:20000/docs**

La interfaz Swagger UI te permite:
- 📖 Ver todos los endpoints disponibles
- 🧪 Probar las peticiones directamente desde el navegador
- 📋 Ver schemas de request/response
- ✅ Validar payloads antes de enviarlos

## 🏗️ Arquitectura

```
src/
├── api/                    # Rutas de la API
│   ├── assets.ts          # Endpoints de activos y documentos
│   └── workOrders.ts      # Endpoints de órdenes de trabajo
├── core/                   # Configuración central
│   ├── config.ts          # Variables de entorno
│   └── database.ts        # Conexión Prisma
├── models/                 # Schemas Zod
│   ├── asset.ts
│   ├── document.ts
│   └── workOrder.ts
├── services/               # Lógica de negocio
│   ├── asset.service.ts
│   ├── document.service.ts
│   └── workOrder.service.ts
├── prisma/
│   └── schema.prisma      # Definición del modelo de datos
└── index.ts               # Punto de entrada
```

## 🗄️ Base de Datos

### Modelo de Datos

#### Asset
```typescript
{
  id: number              // ID interno autoincremental
  prismaId: string        // ID único externo (UNIQUE)
  siteId: number          // ID del sitio
  assetName?: string      // Nombre del activo
  equipmentType?: string  // Tipo de equipo
  businessUnit?: string   // Unidad de negocio
  parentAsset?: string    // Prisma ID del activo padre
  // ... más campos
}
```

#### Document
```typescript
{
  id: string              // ID del documento (extraído de XML o UUID)
  assetId: number         // FK a Asset
  fileName: string        // Nombre del archivo
  md5: string            // Hash MD5 del contenido
  storagePath: string    // Ruta de almacenamiento
  metadata: {...}        // Metadatos extraídos del XML ENI
}
```

#### WorkOrder
```typescript
{
  id: number             // ID interno autoincremental
  assetId: number        // FK a Asset
  workOrder: number      // Número de orden (único por asset)
  workOrderName?: string
  workOrderState?: string
  // ... más campos
}
```

### Características de BD

- **Composite Keys**: WorkOrder usa `(assetId, workOrder)` como clave única
- **Upsert Operations**: Soporte para crear o actualizar en una sola operación
- **Foreign Keys**: Relaciones garantizadas por BD
- **Metadata EAV**: Sistema de metadatos flexible para documentos XML

## ⚠️ Manejo de Errores

La API devuelve códigos HTTP estándar:

| Código | Descripción |
|--------|-------------|
| `200` | ✅ Operación exitosa |
| `201` | ✅ Recurso creado |
| `400` | ❌ Petición inválida (validación fallida) |
| `404` | ❌ Recurso no encontrado |
| `409` | ❌ Conflicto (recurso ya existe) |
| `500` | ❌ Error interno del servidor |

### Formato de Error

```json
{
  "detail": "Asset not found",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["prismaId"],
      "message": "Required"
    }
  ]
}
```

## 🔒 Extracción de Metadatos XML

Los documentos XML ENI son procesados automáticamente:

1. **Upload**: Se sube el archivo `.xml`
2. **Parsing**: Se extrae el contenido con `xml2js`
3. **Metadata**: Se capturan campos ENI estándar:
   - `Identificador` (usado como ID del documento)
   - `Organo`
   - `FechaCaptura`
   - `TipoDocumental`
   - `EstadoElaboracion`
4. **Storage**: Archivo guardado en `storage_path`
5. **Hash**: Se calcula MD5 para verificación de integridad

## 🧪 Testing

```bash
# Ejecutar health check
curl http://localhost:20000/health

# Verificar OpenAPI spec
curl http://localhost:20000/openapi.json
```

## 📝 Notas de Desarrollo

- **Prisma 7**: Se usa adaptador `@prisma/adapter-pg` con pool de conexiones
- **Validación**: Todos los inputs pasan por schemas Zod
- **Type Safety**: TypeScript estricto en todo el proyecto
- **Error Handling**: Try-catch en todos los endpoints
- **Graceful Shutdown**: Cierre controlado de conexiones BD

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request


## 👥 Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando Node.js, TypeScript, Express y Prisma**