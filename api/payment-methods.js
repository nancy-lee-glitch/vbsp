import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const methods = await sql`SELECT * FROM payment_methods ORDER BY id ASC`;
      return res.status(200).json({ success: true, paymentMethods: methods });
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      const id = b.id || `PM-${Date.now()}`;
      const category = b.category || 'CRYPTO';
      const name = b.name || 'Payment Method';
      const symbol = b.symbol || '';
      const network = b.network || '';
      const walletAddress = b.wallet_address || b.walletAddress || '';
      const memoTag = b.memo_tag || b.memoTag || '';
      const bankName = b.bank_name || b.bankName || '';
      const accountHolder = b.account_holder || b.accountHolder || '';
      const routingNumber = b.routing_number || b.routingNumber || '';
      const accountNumber = b.account_number || b.accountNumber || '';
      const swiftBic = b.swift_bic || b.swiftBic || '';
      const handle = b.handle || '';
      const qrImageUrl = b.qr_image_url || b.qrImageUrl || '';
      const instructions = b.instructions || '';
      const minDeposit = Number(b.min_deposit || b.minDeposit || 5000);
      const maxDeposit = Number(b.max_deposit || b.maxDeposit || 500000);
      const isActive = b.is_active !== undefined ? b.is_active : (b.isActive !== undefined ? b.isActive : true);

      const created = await sql`
        INSERT INTO payment_methods (
          id, category, name, symbol, network, wallet_address, memo_tag,
          bank_name, account_holder, routing_number, account_number,
          swift_bic, handle, qr_image_url, instructions, min_deposit,
          max_deposit, is_active
        ) VALUES (
          ${id}, ${category}, ${name}, ${symbol}, ${network}, ${walletAddress}, ${memoTag},
          ${bankName}, ${accountHolder}, ${routingNumber}, ${accountNumber},
          ${swiftBic}, ${handle}, ${qrImageUrl}, ${instructions}, ${minDeposit},
          ${maxDeposit}, ${isActive}
        )
        RETURNING *
      `;

      return res.status(201).json({ success: true, paymentMethod: created[0] });
    }

    if (req.method === 'PUT') {
      const id = req.query.id || req.body.id;
      const b = req.body || {};

      if (!id) {
        return res.status(400).json({ success: false, error: 'Payment method ID required' });
      }

      const updated = await sql`
        UPDATE payment_methods SET
          category = COALESCE(${b.category || null}, category),
          name = COALESCE(${b.name || null}, name),
          symbol = COALESCE(${b.symbol || null}, symbol),
          network = COALESCE(${b.network || null}, network),
          wallet_address = COALESCE(${b.wallet_address || b.walletAddress || null}, wallet_address),
          memo_tag = COALESCE(${b.memo_tag || b.memoTag || null}, memo_tag),
          bank_name = COALESCE(${b.bank_name || b.bankName || null}, bank_name),
          account_holder = COALESCE(${b.account_holder || b.accountHolder || null}, account_holder),
          routing_number = COALESCE(${b.routing_number || b.routingNumber || null}, routing_number),
          account_number = COALESCE(${b.account_number || b.accountNumber || null}, account_number),
          swift_bic = COALESCE(${b.swift_bic || b.swiftBic || null}, swift_bic),
          handle = COALESCE(${b.handle || null}, handle),
          qr_image_url = COALESCE(${b.qr_image_url || b.qrImageUrl || null}, qr_image_url),
          instructions = COALESCE(${b.instructions || null}, instructions),
          min_deposit = COALESCE(${b.min_deposit !== undefined ? Number(b.min_deposit) : null}, min_deposit),
          max_deposit = COALESCE(${b.max_deposit !== undefined ? Number(b.max_deposit) : null}, max_deposit),
          is_active = COALESCE(${b.is_active !== undefined ? b.is_active : (b.isActive !== undefined ? b.isActive : null)}, is_active),
          updated_at = NOW()
        WHERE id = ${String(id)}
        RETURNING *
      `;

      return res.status(200).json({ success: true, paymentMethod: updated[0] });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (id) {
        await sql`DELETE FROM payment_methods WHERE id = ${String(id)}`;
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ success: false, error: 'Payment method ID required' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/payment-methods:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
