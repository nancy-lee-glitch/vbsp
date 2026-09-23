import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: List withdrawals
    if (req.method === 'GET') {
      const participantId = req.query.participantId || req.query.participant_id;
      const accountNumber = req.query.accountNumber || req.query.account_number;
      const email = req.query.email || req.query.user_email;

      let withdrawals;
      if (participantId || accountNumber || email) {
        let pId = parseInt(participantId, 10);
        if ((isNaN(pId) || pId <= 0) && (accountNumber || email)) {
          const acc = accountNumber || '';
          const em = email || '';
          const found = await sql`
            SELECT id FROM participant_accounts 
            WHERE (account_number = ${String(acc)} AND ${acc} != '')
               OR (LOWER(email) = ${String(em).toLowerCase()} AND ${em} != '')
            LIMIT 1
          `;
          if (found.length > 0) pId = found[0].id;
        }

        if (!isNaN(pId) && pId > 0) {
          withdrawals = await sql`
            SELECT * FROM withdrawal_requests 
            WHERE participant_id = ${pId} 
            ORDER BY created_at DESC
          `;
        } else if (accountNumber) {
          withdrawals = await sql`
            SELECT * FROM withdrawal_requests 
            WHERE user_account_number = ${String(accountNumber)} 
            ORDER BY created_at DESC
          `;
        } else {
          withdrawals = [];
        }
      } else {
        withdrawals = await sql`SELECT * FROM withdrawal_requests ORDER BY created_at DESC`;
      }

      return res.status(200).json({ success: true, withdrawals });
    }

    // POST: Submit withdrawal request
    if (req.method === 'POST') {
      const b = req.body || {};
      const rawAmount = Number(b.amount);
      const amount = (isNaN(rawAmount) || !isFinite(rawAmount)) ? 0 : Math.max(0, rawAmount);

      let participantId = parseInt(b.participant_id || b.participantId, 10);
      const userAcc = b.user_account_number || b.account_number || b.accountNumber || '';
      const userEmail = b.user_email || b.email || '';

      if (isNaN(participantId) || participantId <= 0) {
        if (userAcc || userEmail) {
          const found = await sql`
            SELECT id FROM participant_accounts 
            WHERE (account_number = ${userAcc} AND ${userAcc} != '')
               OR (LOWER(email) = ${userEmail.toLowerCase()} AND ${userEmail} != '')
            LIMIT 1
          `;
          if (found.length > 0) participantId = found[0].id;
        }
      }

      if (isNaN(participantId) || participantId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Unable to resolve participant account for withdrawal request.'
        });
      }

      const reqNum = b.request_number || b.request_id || `WDL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const userName = b.user_name || 'Participant';
      const wdlType = b.withdrawal_type || 'In-Service Bullion Distribution';
      const delivery = b.delivery_option || 'Insured Armored Courier Delivery';
      const dest = b.destination_address || '';
      const bankDetails = b.bank_details || '';
      const reason = b.reason || 'Participant in-service distribution request';

      const result = await sql`
        INSERT INTO withdrawal_requests (
          request_number, request_id, participant_id, user_account_number, user_name,
          withdrawal_type, amount, delivery_option, destination_address, bank_details,
          status, reason
        ) VALUES (
          ${reqNum}, ${reqNum}, ${participantId}, ${userAcc}, ${userName},
          ${wdlType}, ${amount}, ${delivery}, ${dest}, ${bankDetails},
          'Pending Review', ${reason}
        )
        RETURNING *
      `;

      return res.status(201).json({ success: true, withdrawal: result[0] });
    }

    // PUT: Update withdrawal status (Approve / Reject)
    if (req.method === 'PUT') {
      const wdlId = req.query.id || req.body.id || req.body.withdrawalId;
      const { status, adminNotes, admin_notes, notes } = req.body || {};
      const note = adminNotes || admin_notes || notes || '';

      if (!wdlId) {
        return res.status(400).json({ success: false, error: 'Withdrawal ID is required' });
      }

      const cleanId = parseInt(String(wdlId).split('/')[0], 10);
      const strId = String(wdlId);

      let updated;
      if (!isNaN(cleanId) && cleanId > 0) {
        updated = await sql`
          UPDATE withdrawal_requests SET
            status = ${status || 'Approved'},
            admin_notes = COALESCE(${note || null}, admin_notes),
            updated_at = NOW()
          WHERE id = ${cleanId} OR request_number = ${strId} OR request_id = ${strId}
          RETURNING *
        `;
      } else {
        updated = await sql`
          UPDATE withdrawal_requests SET
            status = ${status || 'Approved'},
            admin_notes = COALESCE(${note || null}, admin_notes),
            updated_at = NOW()
          WHERE request_number = ${strId} OR request_id = ${strId}
          RETURNING *
        `;
      }

      if (!updated || updated.length === 0) {
        return res.status(404).json({ success: false, message: 'Withdrawal record not found' });
      }

      const wdl = updated[0];

      // If approved, deduct balance
      if (status === 'Approved' || status === 'Completed' || status === 'Disbursed') {
        const deductAmt = Number(wdl.amount) || 0;
        if (deductAmt > 0) {
          await sql`
            UPDATE participant_accounts SET
              total_balance = GREATEST(0, total_balance - ${deductAmt}),
              traditional_balance = GREATEST(0, traditional_balance - ${deductAmt}),
              updated_at = NOW()
            WHERE id = ${wdl.participant_id} OR account_number = ${wdl.user_account_number}
          `;

          // Record in transactions ledger
          try {
            await sql`
              INSERT INTO transactions (
                tx_code, participant_id, account_number, type, description, amount, status, category, fund_code, metal_equivalent
              ) VALUES (
                ${`TX-${wdl.request_number || Date.now()}`},
                ${wdl.participant_id},
                ${wdl.user_account_number},
                'Custodial Withdrawal',
                'In-Service Bullion / Cash Distribution Disbursed',
                ${-deductAmt},
                'Completed',
                'Withdrawal',
                'G',
                '-Disbursed'
              )
            `;
          } catch (e) {
            console.warn('Transaction ledger write notice:', e.message);
          }

          // Send confirmation message to mailbox
          try {
            await sql`
              INSERT INTO messages (
                participant_id, sender_type, sender_name, sender_email,
                subject, body, category, is_read
              ) VALUES (
                ${wdl.participant_id},
                'admin',
                'Cassivon Vault Operations & Disbursements',
                'operations@cassivon.com',
                ${`Withdrawal Order #${wdl.request_number} Approved`},
                ${`Your distribution request for $${deductAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been approved by the vault custodian. Delivery: ${wdl.delivery_option || 'Insured Delivery'}. ${note ? 'Admin Note: ' + note : ''}`},
                'official',
                false
              )
            `;
          } catch (e) {
            console.warn('Mailbox notice write:', e.message);
          }
        }
      }

      return res.status(200).json({ success: true, withdrawal: wdl });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/withdrawals:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
