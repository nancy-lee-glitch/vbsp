import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT NOW() as current_time`;
    
    return res.status(200).json({
      status: 'ok',
      message: 'Successfully connected to Neon database',
      time: result[0].current_time
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
