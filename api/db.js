import postgres from 'postgres';

// Initialize connection to Neon PostgreSQL using PGHOST, PGUSER, PGDATABASE, PGPASSWORD
export function createPostgresClient() {
  const host = process.env.PGHOST;
  const user = process.env.PGUSER || process.env.PGUSERNAME;
  const database = process.env.PGDATABASE;
  const password = process.env.PGPASSWORD;
  const port = Number(process.env.PGPORT) || 5432;

  if (host && user && database && password) {
    return postgres({
      host,
      user,
      database,
      password,
      port,
      ssl: 'require',
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10
    });
  }

  const connString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (connString) {
    return postgres(connString, {
      ssl: 'require',
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10
    });
  }

  throw new Error('PostgreSQL credentials not found in PGHOST/PGUSER/PGDATABASE/PGPASSWORD or DATABASE_URL');
}

export const sql = createPostgresClient();
export default sql;
