import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: List loans
    if (req.method === 'GET') {
      const participantId = req.query.participantId || req.query.participant_id;
      const accountNumber = req.query.accountNumber || req.query.account_number;
      const email = req.query.email || req.query.user_email;

      let loans;
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
          loans = await sql`
            SELECT * FROM loan_applications 
            WHERE participant_id = ${pId} 
            ORDER BY created_at DESC
          `;
        } else if (accountNumber) {
          loans = await sql`
            SELECT * FROM loan_applications 
            WHERE user_account_number = ${String(accountNumber)} 
            ORDER BY created_at DESC
          `;
        } else {
          loans = [];
        }
      } else {
        loans = await sql`SELECT * FROM loan_applications ORDER BY created_at DESC`;
      }

      return res.status(200).json({ success: true, loans });
    }

    // POST: Apply for loan
    if (req.method === 'POST') {
      const b = req.body || {};
      const rawAmount = Number(b.requested_amount || b.amount);
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
          error: 'Unable to resolve participant account for loan application.'
        });
      }

      const loanNum = b.loan_number || b.loan_id || `LN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const userName = b.user_name || 'Participant';
      const loanType = b.loan_type || 'General Purpose Bullion Loan';
      const termMonths = parseInt(b.term_months || 36, 10) || 36;
      const rate = Number(b.interest_rate || 4.25) || 4.25;
      const monthlyPayment = Number(b.monthly_payment || (amount / termMonths)) || 0;
      const purpose = b.purpose || b.reason || 'Personal financial liquidity against bullion collateral.';

      const result = await sql`
        INSERT INTO loan_applications (
          loan_number, loan_id, participant_id, user_account_number, user_name,
          loan_type, requested_amount, amount, term_months, interest_rate,
          monthly_payment, status, purpose
        ) VALUES (
          ${loanNum}, ${loanNum}, ${participantId}, ${userAcc}, ${userName},
          ${loanType}, ${amount}, ${amount}, ${termMonths}, ${rate},
          ${monthlyPayment}, 'Pending Review', ${purpose}
        )
        RETURNING *
      `;

      return res.status(201).json({ success: true, loan: result[0] });
    }

    // PUT: Update loan status (Approve / Reject)
    if (req.method === 'PUT') {
      const loanId = req.query.id || req.body.id || req.body.loanId;
      const { status, adminNotes, admin_notes, notes } = req.body || {};
      const note = adminNotes || admin_notes || notes || '';

      if (!loanId) {
        return res.status(400).json({ success: false, error: 'Loan ID is required' });
      }

      const cleanId = parseInt(String(loanId).split('/')[0], 10);
      const strId = String(loanId);

      let updated;
      if (!isNaN(cleanId) && cleanId > 0) {
        updated = await sql`
          UPDATE loan_applications SET
            status = ${status || 'Approved'},
            admin_notes = COALESCE(${note || null}, admin_notes),
            updated_at = NOW()
          WHERE id = ${cleanId} OR loan_number = ${strId} OR loan_id = ${strId}
          RETURNING *
        `;
      } else {
        updated = await sql`
          UPDATE loan_applications SET
            status = ${status || 'Approved'},
            admin_notes = COALESCE(${note || null}, admin_notes),
            updated_at = NOW()
          WHERE loan_number = ${strId} OR loan_id = ${strId}
          RETURNING *
        `;
      }

      if (!updated || updated.length === 0) {
        return res.status(404).json({ success: false, message: 'Loan application not found' });
      }

      const loan = updated[0];

      // Send confirmation message to mailbox
      try {
        await sql`
          INSERT INTO messages (
            participant_id, sender_type, sender_name, sender_email,
            subject, body, category, is_read
          ) VALUES (
            ${loan.participant_id},
            'admin',
            'Cassivon Loan Administration & Board',
            'loans@cassivon.com',
            ${`Loan Application #${loan.loan_number} - ${status}`},
            ${`Your application for a $${Number(loan.requested_amount).toLocaleString()} bullion loan has been marked as "${status}". ${note ? 'Auditor Note: ' + note : ''}`},
            'official',
            false
          )
        `;
      } catch (e) {
        console.warn('Mail notice write failed:', e.message);
      }

      return res.status(200).json({ success: true, loan });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/loans:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
