import sql from './db.js';

export default async function handler(req, res) {
  try {
    const result = await sql`SELECT NOW() as current_time, current_database() as database_name`;
    
    return res.status(200).json({
      status: 'ok',
      message: 'Successfully connected to Neon PostgreSQL database using postgres package',
      database: result[0]?.database_name,
      time: result[0]?.current_time
    });
  } catch (error) {
    console.error('Database health error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
