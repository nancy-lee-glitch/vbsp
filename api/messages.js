import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: List messages
    if (req.method === 'GET') {
      const participantId = req.query.participantId || req.query.participant_id;
      const accountNumber = req.query.accountNumber || req.query.account_number;

      let msgs;
      if (participantId || accountNumber) {
        let pId = parseInt(participantId, 10);
        if (isNaN(pId) && (accountNumber || participantId)) {
          const acc = accountNumber || participantId;
          const found = await sql`
            SELECT id FROM participant_accounts 
            WHERE account_number = ${String(acc)} OR email = ${String(acc)} 
            LIMIT 1
          `;
          if (found.length > 0) pId = found[0].id;
        }

        if (!isNaN(pId) && pId > 0) {
          msgs = await sql`
            SELECT * FROM messages 
            WHERE participant_id = ${pId} 
            ORDER BY created_at DESC
          `;
        } else {
          msgs = await sql`SELECT * FROM messages ORDER BY created_at DESC LIMIT 50`;
        }
      } else {
        msgs = await sql`SELECT * FROM messages ORDER BY created_at DESC LIMIT 100`;
      }

      return res.status(200).json({ success: true, messages: msgs });
    }

    // POST: Send message
    if (req.method === 'POST') {
      const b = req.body || {};
      let participantId = parseInt(b.participant_id || b.participantId, 10);
      const userAcc = b.user_account_number || b.account_number || '';
      const userEmail = b.user_email || b.email || '';

      if (isNaN(participantId) || participantId <= 0) {
        if (userAcc || userEmail) {
          const found = await sql`
            SELECT id FROM participant_accounts 
            WHERE account_number = ${userAcc} OR email = ${userEmail} 
            LIMIT 1
          `;
          if (found.length > 0) participantId = found[0].id;
        }
      }

      if (isNaN(participantId) || participantId <= 0) {
        const fallback = await sql`SELECT id FROM participant_accounts ORDER BY id ASC LIMIT 1`;
        participantId = fallback.length > 0 ? fallback[0].id : 1;
      }

      const senderType = b.sender_type || (b.senderType === 'admin' ? 'admin' : 'participant');
      const senderName = b.sender_name || (senderType === 'admin' ? 'Cassivon Custody Admin' : 'Participant');
      const senderEmail = b.sender_email || (senderType === 'admin' ? 'custody@cassivon.com' : userEmail);
      const subject = b.subject || 'Secure Dispatch';
      const bodyText = b.body || '';
      const category = b.category || 'official';

      const result = await sql`
        INSERT INTO messages (
          participant_id, sender_type, sender_name, sender_email,
          subject, body, category, is_read
        ) VALUES (
          ${participantId}, ${senderType}, ${senderName}, ${senderEmail},
          ${subject}, ${bodyText}, ${category}, false
        )
        RETURNING *
      `;

      return res.status(201).json({ success: true, message: result[0] });
    }

    // PUT: Mark message as read
    if (req.method === 'PUT') {
      const msgId = req.query.id || req.body.id;
      const isRead = req.body.isRead !== undefined ? req.body.isRead : (req.body.is_read !== undefined ? req.body.is_read : true);
      const cleanId = parseInt(String(msgId).split('/')[0], 10);

      if (!isNaN(cleanId) && cleanId > 0) {
        const updated = await sql`
          UPDATE messages SET is_read = ${isRead}
          WHERE id = ${cleanId}
          RETURNING *
        `;
        return res.status(200).json({ success: true, message: updated[0] });
      }

      return res.status(400).json({ success: false, error: 'Invalid message ID' });
    }

    // DELETE: Delete message
    if (req.method === 'DELETE') {
      const msgId = req.query.id;
      const cleanId = parseInt(String(msgId).split('/')[0], 10);

      if (!isNaN(cleanId) && cleanId > 0) {
        await sql`DELETE FROM messages WHERE id = ${cleanId}`;
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ success: false, error: 'Invalid message ID' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/messages:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
