import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const funds = await sql`SELECT * FROM fund_prices ORDER BY id ASC`;
      return res.status(200).json({ success: true, funds });
    }

    if (req.method === 'PUT') {
      const { fundCode, code, price, current_share_price, ytdReturn, ytd_return } = req.body || {};
      const fCode = fundCode || code;
      const cleanPrice = Number(price || current_share_price);
      const cleanYtd = Number(ytdReturn || ytd_return || 0);

      if (!fCode) {
        return res.status(400).json({ success: false, error: 'Fund code required' });
      }

      const updated = await sql`
        UPDATE fund_prices SET
          current_share_price = COALESCE(${cleanPrice || null}, current_share_price),
          ytd_return = COALESCE(${cleanYtd || null}, ytd_return),
          updated_at = NOW()
        WHERE fund_code = ${fCode} OR code = ${fCode}
        RETURNING *
      `;

      return res.status(200).json({ success: true, fund: updated[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/funds:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
