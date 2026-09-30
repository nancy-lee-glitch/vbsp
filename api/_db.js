import postgres from 'postgres';

let _sql = null;

export function getPostgresClient() {
  if (_sql) return _sql;

  // 1. Check all standard pooled & direct connection string environment variables
  const connString = process.env.DATABASE_URL || 
                     process.env.POSTGRES_URL || 
                     process.env.POSTGRES_PRISMA_URL || 
                     process.env.POSTGRES_URL_NON_POOLING;

  if (connString) {
    _sql = postgres(connString, {
      ssl: 'require',
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10
    });
    return _sql;
  }

  // 2. Fall back to individual PG parameters
  const host = process.env.PGHOST;
  const user = process.env.PGUSER || process.env.PGUSERNAME;
  const database = process.env.PGDATABASE;
  const password = process.env.PGPASSWORD;
  const port = Number(process.env.PGPORT) || 5432;

  if (host && user && database && password) {
    _sql = postgres({
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
    return _sql;
  }

  throw new Error('Neon PostgreSQL credentials not found. Please set DATABASE_URL or POSTGRES_URL in environment variables.');
}

// Tagged template proxy function that lazily calls the postgres client
export const sql = (strings, ...values) => {
  const client = getPostgresClient();
  return client(strings, ...values);
};

// Also expose helper methods that postgres library provides (e.g., sql.begin, sql.file)
export default new Proxy(sql, {
  get(target, prop) {
    if (prop in target) return target[prop];
    const client = getPostgresClient();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});
