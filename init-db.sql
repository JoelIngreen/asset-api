-- 1) Crear schema
CREATE SCHEMA IF NOT EXISTS lake;

-- 2) Que el usuario pueda usar/crear cosas en el schema
GRANT USAGE, CREATE ON SCHEMA lake TO appuser;

-- 3) Permisos sobre lo que exista ahora (si hubiera algo)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA lake TO appuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA lake TO appuser;

-- 4) Permisos por defecto para objetos futuros creados en ese schema
ALTER DEFAULT PRIVILEGES IN SCHEMA lake
GRANT ALL PRIVILEGES ON TABLES TO appuser;

ALTER DEFAULT PRIVILEGES IN SCHEMA lake
GRANT ALL PRIVILEGES ON SEQUENCES TO appuser;

-- 5) Search path por defecto
ALTER DATABASE assets_db SET search_path TO lake, public;
