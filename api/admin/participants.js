import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // GET - List all participants or get one
    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        const result = await sql`
          SELECT * FROM participant_accounts WHERE id = ${Number(id)} LIMIT 1
        `;
        if (result.length === 0) {
          return res.status(404).json({ success: false, message: 'Participant not found' });
        }
        return res.status(200).json({ success: true, participant: result[0] });
      }

      // List all
      const result = await sql`
        SELECT 
          id, account_number, email, full_name, account_type, 
          total_balance, traditional_balance, roth_balance,
          gold_ounces_equivalent, silver_ounces_equivalent,
          account_status, thriftline_pin, created_at
        FROM participant_accounts 
        ORDER BY created_at DESC
      `;
      return res.status(200).json({ success: true, participants: result });
    }

    // PUT - Update participant (balance, status, etc.)
    if (req.method === 'PUT') {
      const { id, total_balance, traditional_balance, roth_balance, account_status, full_name } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Participant id is required' });
      }

      const result = await sql`
        UPDATE participant_accounts SET
          total_balance = COALESCE(${total_balance}, total_balance),
          traditional_balance = COALESCE(${traditional_balance}, traditional_balance),
          roth_balance = COALESCE(${roth_balance}, roth_balance),
          account_status = COALESCE(${account_status}, account_status),
          full_name = COALESCE(${full_name}, full_name),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${Number(id)}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Participant not found' });
      }

      return res.status(200).json({ success: true, message: 'Participant updated', participant: result[0] });
    }

    // DELETE - Remove participant
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Participant id is required' });
      }

      // Also delete related KYC documents
      await sql`DELETE FROM kyc_documents WHERE participant_id = ${Number(id)}`;
      await sql`DELETE FROM participant_accounts WHERE id = ${Number(id)}`;

      return res.status(200).json({ success: true, message: 'Participant deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin participants error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}
