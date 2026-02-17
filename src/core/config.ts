import dotenv from 'dotenv';

dotenv.config();

interface AppSettings {
  apiPort: number;
  enableDatabase: boolean;
  postgres: {
    user: string | undefined;
    password: string | undefined;
    host: string | undefined;
    port: number;
    database: string | undefined;
  };
  storagePath: string;
  schemaName: string;
}

class Settings {
  public readonly apiPort: number;
  public readonly enableDatabase: boolean;
  public readonly postgres: AppSettings['postgres'];
  public readonly storagePath: string;
  public readonly schemaName: string;

  constructor() {
    this.enableDatabase = process.env.enable_database === '1';
    this.apiPort = Number.parseInt(process.env.API_PORT || '20000', 10);
    
    this.postgres = {
      user: process.env.postgres_user,
      password: process.env.postgres_password,
      host: process.env.postgres_host,
      port: Number.parseInt(process.env.postgres_port || '5432', 10),
      database: process.env.postgres_db,
    };

    this.storagePath = process.env.storage_path || './storage';
    this.schemaName = process.env.schema_name || 'lake';

    this.validateDatabaseSettings();
  }

  private validateDatabaseSettings(): void {
    if (this.enableDatabase) {
      const requiredFields = ['user', 'password', 'host', 'database'];
      for (const field of requiredFields) {
        if (!this.postgres[field as keyof typeof this.postgres]) {
          throw new Error(
            `'postgres_${field}' must be set when 'enable_database' is true`
          );
        }
      }
    }
  }

  public get databaseUrl(): string | null {
    if (this.enableDatabase && this.postgres.user && this.postgres.password && 
        this.postgres.host && this.postgres.database) {
      return `postgresql://${this.postgres.user}:${this.postgres.password}@${this.postgres.host}:${this.postgres.port}/${this.postgres.database}?schema=${this.schemaName}`;
    }
    return null;
  }
}

export const settings = new Settings();