import sql from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: List all deposits or filter by participant
    if (req.method === 'GET') {
      const participantId = req.query.participantId || req.query.participant_id || req.query.pId;
      const accountNumber = req.query.accountNumber || req.query.account_number;

      let deposits;
      if (participantId || accountNumber) {
        let pId = parseInt(participantId, 10);
        if (isNaN(pId) && (accountNumber || participantId)) {
          const acc = accountNumber || participantId;
          const found = await sql`
            SELECT id FROM participant_accounts 
            WHERE account_number = ${String(acc)} OR email = ${String(acc)} 
            LIMIT 1
          `;
          if (found.length > 0) {
            pId = found[0].id;
          }
        }

        if (!isNaN(pId) && pId > 0) {
          deposits = await sql`
            SELECT * FROM deposits 
            WHERE participant_id = ${pId} 
            ORDER BY created_at DESC
          `;
        } else if (accountNumber) {
          deposits = await sql`
            SELECT * FROM deposits 
            WHERE user_account_number = ${String(accountNumber)} 
            ORDER BY created_at DESC
          `;
        } else {
          deposits = await sql`SELECT * FROM deposits ORDER BY created_at DESC`;
        }
      } else {
        deposits = await sql`SELECT * FROM deposits ORDER BY created_at DESC`;
      }

      return res.status(200).json({ success: true, deposits });
    }

    // POST: Create a new deposit with payment proof
    if (req.method === 'POST') {
      const body = req.body || {};
      const rawAmount = Number(body.amount);
      const amount = (isNaN(rawAmount) || !isFinite(rawAmount)) ? 0 : Math.max(0, rawAmount);

      if (amount <= 0) {
        return res.status(400).json({ success: false, error: 'Deposit amount must be greater than zero.' });
      }

      // Resolve participant integer ID safely without NaN
      let participantId = parseInt(body.participant_id || body.participantId, 10);
      const userAcc = body.user_account_number || body.account_number || '';
      const userEmail = body.user_email || body.email || '';

      if (isNaN(participantId) || participantId <= 0) {
        if (userAcc || userEmail) {
          const found = await sql`
            SELECT id, full_name, account_number FROM participant_accounts 
            WHERE account_number = ${userAcc} OR email = ${userEmail} 
            LIMIT 1
          `;
          if (found.length > 0) {
            participantId = found[0].id;
          }
        }
      }

      // If still not found, pick the first existing participant to preserve FK integrity
      if (isNaN(participantId) || participantId <= 0) {
        const fallback = await sql`SELECT id FROM participant_accounts ORDER BY id ASC LIMIT 1`;
        if (fallback.length > 0) {
          participantId = fallback[0].id;
        } else {
          participantId = 1;
        }
      }

      const refId = body.reference_id || body.tx_id || `DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const userName = body.user_name || body.participant_name || 'Participant';
      const targetFund = body.target_fund_code || body.fund_code || 'G';
      const paymentMethodId = body.payment_method_id || '';
      const paymentMethodName = body.payment_method_name || 'Wire Transfer';
      const paymentRef = body.payment_reference || body.transaction_hash || '';
      const proofFileName = body.proof_file_name || 'transfer_receipt.png';
      const receiptImageUrl = body.receipt_image_url || body.proof_file_data || '';
      const notes = body.notes || 'Institutional bullion wire confirmation submitted.';

      const result = await sql`
        INSERT INTO deposits (
          reference_id, participant_id, user_account_number, user_name, target_fund_code,
          payment_method_id, payment_method_name, amount, estimated_shares, transaction_hash,
          proof_file_name, receipt_image_url, status, notes
        ) VALUES (
          ${refId}, ${participantId}, ${userAcc}, ${userName}, ${targetFund},
          ${paymentMethodId}, ${paymentMethodName}, ${amount}, ${amount / 2610}, ${paymentRef},
          ${proofFileName}, ${receiptImageUrl}, 'Pending Review', ${notes}
        )
        RETURNING *
      `;

      return res.status(201).json({ success: true, deposit: result[0] });
    }

    // PUT: Update deposit status (Approve / Reject)
    if (req.method === 'PUT') {
      const depositId = req.query.id || req.body.id || req.body.depositId;
      const { status, adminNotes, admin_notes, notes } = req.body || {};
      const note = adminNotes || admin_notes || notes || '';

      if (!depositId) {
        return res.status(400).json({ success: false, error: 'Deposit ID is required' });
      }

      const cleanId = parseInt(String(depositId).split('/')[0], 10);
      const strId = String(depositId);

      let updated;
      if (!isNaN(cleanId) && cleanId > 0) {
        updated = await sql`
          UPDATE deposits SET
            status = ${status || 'Approved'},
            notes = COALESCE(${note || null}, notes),
            updated_at = NOW()
          WHERE id = ${cleanId} OR reference_id = ${strId}
          RETURNING *
        `;
      } else {
        updated = await sql`
          UPDATE deposits SET
            status = ${status || 'Approved'},
            notes = COALESCE(${note || null}, notes),
            updated_at = NOW()
          WHERE reference_id = ${strId}
          RETURNING *
        `;
      }

      if (!updated || updated.length === 0) {
        return res.status(404).json({ success: false, message: 'Deposit record not found' });
      }

      const dep = updated[0];

      // If approved, automatically credit participant's account balance!
      if (status === 'Approved' || status === 'Verified & Credited' || status === 'VAULT_CONFIRMED') {
        const creditAmt = Number(dep.amount) || 0;
        if (creditAmt > 0) {
          await sql`
            UPDATE participant_accounts SET
              total_balance = total_balance + ${creditAmt},
              traditional_balance = traditional_balance + ${creditAmt},
              updated_at = NOW()
            WHERE id = ${dep.participant_id} OR account_number = ${dep.user_account_number}
          `;

          // Record in transactions ledger
          try {
            await sql`
              INSERT INTO transactions (
                tx_code, participant_id, account_number, type, description, amount, status, category, fund_code, metal_equivalent
              ) VALUES (
                ${`TX-${dep.reference_id || Date.now()}`},
                ${dep.participant_id},
                ${dep.user_account_number},
                'Wire Deposit',
                'Approved Bullion Deposit - Funds Credited to Vault Balance',
                ${creditAmt},
                'Completed',
                'Deposit',
                ${dep.target_fund_code || 'G'},
                ${`+${(creditAmt / 2610).toFixed(2)} oz Au`}
              )
            `;
          } catch (e) {
            console.warn('Transaction ledger write notice:', e.message);
          }

          // Send message to participant's mailbox
          try {
            await sql`
              INSERT INTO messages (
                participant_id, sender_type, sender_name, sender_email,
                subject, body, category, is_read
              ) VALUES (
                ${dep.participant_id},
                'admin',
                'Cassivon Depository Vault Administration',
                'operations@cassivon.com',
                ${`Deposit Confirmed & Credited - Ref #${dep.reference_id}`},
                ${`Your bullion deposit of $${creditAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been verified and fully credited to your allocated vault balance. Confirmation Ref: ${dep.reference_id}.`},
                'official',
                false
              )
            `;
          } catch (e) {
            console.warn('Mailbox notice write:', e.message);
          }
        }
      }

      return res.status(200).json({ success: true, deposit: dep });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/deposits:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
