import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: List all participants or get single participant
    if (req.method === 'GET') {
      const idParam = req.query.id || req.query.participantId;
      const accountParam = req.query.accountNumber || req.query.account_number;
      const emailParam = req.query.email;

      if (idParam || accountParam || emailParam) {
        let cleanId = parseInt(String(idParam).split('/')[0], 10);
        let result;

        if (!isNaN(cleanId) && cleanId > 0) {
          result = await sql`SELECT * FROM participant_accounts WHERE id = ${cleanId} LIMIT 1`;
        } else if (accountParam || idParam) {
          const acc = accountParam || idParam;
          result = await sql`SELECT * FROM participant_accounts WHERE account_number = ${String(acc)} OR email = ${String(acc)} LIMIT 1`;
        } else if (emailParam) {
          result = await sql`SELECT * FROM participant_accounts WHERE email = ${String(emailParam).toLowerCase().trim()} LIMIT 1`;
        }

        if (result && result.length > 0) {
          const p = result[0];
          return res.status(200).json({
            success: true,
            participant: {
              id: p.id,
              accountNumber: p.account_number,
              name: p.full_name,
              email: p.email,
              accountType: p.account_type,
              ssnLast4: p.ssn_last4,
              agency: p.employing_agency,
              hireDate: p.hire_date,
              vaultDepositaryLocation: p.vault_facility,
              totalBalance: Number(p.total_balance) || 0,
              traditionalBalance: Number(p.traditional_balance) || 0,
              rothBalance: Number(p.roth_balance) || 0,
              goldOuncesEquivalent: Number(p.gold_ounces_equivalent) || 0,
              silverOuncesEquivalent: Number(p.silver_ounces_equivalent) || 0,
              ytdReturn: Number(p.ytd_return) || 18.4,
              phone: p.phone,
              address: p.address,
              accountStatus: p.account_status,
              kycStatus: p.kyc_status,
              createdAt: p.created_at
            }
          });
        }
      }

      // Return all participants
      const participants = await sql`SELECT * FROM participant_accounts ORDER BY id ASC`;
      const mapped = participants.map(p => ({
        id: p.id,
        accountNumber: p.account_number,
        name: p.full_name,
        email: p.email,
        accountType: p.account_type,
        ssnLast4: p.ssn_last4,
        agency: p.employing_agency,
        hireDate: p.hire_date,
        vaultDepositaryLocation: p.vault_facility,
        totalBalance: Number(p.total_balance) || 0,
        traditionalBalance: Number(p.traditional_balance) || 0,
        rothBalance: Number(p.roth_balance) || 0,
        goldOuncesEquivalent: Number(p.gold_ounces_equivalent) || 0,
        silverOuncesEquivalent: Number(p.silver_ounces_equivalent) || 0,
        ytdReturn: Number(p.ytd_return) || 18.4,
        phone: p.phone,
        address: p.address,
        accountStatus: p.account_status,
        kycStatus: p.kyc_status,
        createdAt: p.created_at
      }));

      return res.status(200).json({ success: true, participants: mapped });
    }

    // PUT: Update participant balance, status, or details
    if (req.method === 'PUT') {
      const idParam = req.query.id || req.body.id || req.body.participantId;
      const b = req.body || {};

      let cleanId = parseInt(String(idParam).split('/')[0], 10);
      const accNum = b.accountNumber || b.account_number || String(idParam);
      const email = b.email || '';

      // Check current record first
      let current;
      if (!isNaN(cleanId) && cleanId > 0) {
        current = await sql`SELECT * FROM participant_accounts WHERE id = ${cleanId} LIMIT 1`;
      } else {
        current = await sql`SELECT * FROM participant_accounts WHERE account_number = ${accNum} OR email = ${email} LIMIT 1`;
      }

      if (!current || current.length === 0) {
        return res.status(404).json({ success: false, message: 'Participant account not found' });
      }

      const p = current[0];

      // Extract new values or fallback to current
      const newTotal = b.totalBalance !== undefined ? Number(b.totalBalance) : (b.total_balance !== undefined ? Number(b.total_balance) : Number(p.total_balance));
      const newTrad = b.traditionalBalance !== undefined ? Number(b.traditionalBalance) : (b.traditional_balance !== undefined ? Number(b.traditional_balance) : Number(p.traditional_balance));
      const newRoth = b.rothBalance !== undefined ? Number(b.rothBalance) : (b.roth_balance !== undefined ? Number(b.roth_balance) : Number(p.roth_balance));
      const newGold = b.goldOuncesEquivalent !== undefined ? Number(b.goldOuncesEquivalent) : Number(p.gold_ounces_equivalent);
      const newSilver = b.silverOuncesEquivalent !== undefined ? Number(b.silverOuncesEquivalent) : Number(p.silver_ounces_equivalent);
      const newName = b.name || b.full_name || p.full_name;
      const newStatus = b.accountStatus || b.account_status || p.account_status;
      const newKyc = b.kycStatus || b.kyc_status || p.kyc_status;
      const newPhone = b.phone || p.phone;
      const newAddress = b.address || p.address;

      const updated = await sql`
        UPDATE participant_accounts SET
          full_name = ${newName},
          total_balance = ${isNaN(newTotal) ? p.total_balance : newTotal},
          traditional_balance = ${isNaN(newTrad) ? p.traditional_balance : newTrad},
          roth_balance = ${isNaN(newRoth) ? p.roth_balance : newRoth},
          gold_ounces_equivalent = ${isNaN(newGold) ? p.gold_ounces_equivalent : newGold},
          silver_ounces_equivalent = ${isNaN(newSilver) ? p.silver_ounces_equivalent : newSilver},
          account_status = ${newStatus},
          kyc_status = ${newKyc},
          phone = ${newPhone},
          address = ${newAddress},
          updated_at = NOW()
        WHERE id = ${p.id}
        RETURNING *
      `;

      const up = updated[0];
      return res.status(200).json({
        success: true,
        participant: {
          id: up.id,
          accountNumber: up.account_number,
          name: up.full_name,
          email: up.email,
          accountType: up.account_type,
          ssnLast4: up.ssn_last4,
          agency: up.employing_agency,
          hireDate: up.hire_date,
          vaultDepositaryLocation: up.vault_facility,
          totalBalance: Number(up.total_balance) || 0,
          traditionalBalance: Number(up.traditional_balance) || 0,
          rothBalance: Number(up.roth_balance) || 0,
          goldOuncesEquivalent: Number(up.gold_ounces_equivalent) || 0,
          silverOuncesEquivalent: Number(up.silver_ounces_equivalent) || 0,
          ytdReturn: Number(up.ytd_return) || 18.4,
          phone: up.phone,
          address: up.address,
          accountStatus: up.account_status,
          kycStatus: up.kyc_status,
          updatedAt: up.updated_at
        }
      });
    }

    // POST: Create participant
    if (req.method === 'POST') {
      const b = req.body || {};
      const generatedAcc = `CCSP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
      const accNumber = b.accountNumber || b.account_number || generatedAcc;
      const email = (b.email || '').toLowerCase().trim();
      const name = b.name || b.full_name || 'Participant';
      const password = b.password || 'FederalTSP2026!';
      const totalBalance = Number(b.totalBalance || b.total_balance || 0);

      const created = await sql`
        INSERT INTO participant_accounts (
          account_number, email, password_hash, full_name, total_balance,
          traditional_balance, roth_balance, account_status, kyc_status
        ) VALUES (
          ${accNumber}, ${email}, ${password}, ${name}, ${totalBalance},
          ${totalBalance}, 0, 'ACTIVE', 'Not Verified'
        )
        RETURNING *
      `;

      return res.status(201).json({ success: true, participant: created[0] });
    }

    // DELETE: Remove participant
    if (req.method === 'DELETE') {
      const idParam = req.query.id;
      const cleanId = parseInt(String(idParam).split('/')[0], 10);
      if (!isNaN(cleanId) && cleanId > 0) {
        await sql`DELETE FROM participant_accounts WHERE id = ${cleanId}`;
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/participants:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
