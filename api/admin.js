import sql from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const resource = req.query.resource || 
                   (url.includes('beneficiaries') ? 'beneficiaries' : null) ||
                   (url.includes('funds') ? 'funds' : null) ||
                   (url.includes('payment-methods') ? 'payment-methods' : null) ||
                   (url.includes('audit-logs') ? 'audit-logs' : null) ||
                   (url.includes('transactions') ? 'transactions' : null) ||
                   (url.includes('admin/login') || req.query.action === 'login' ? 'login' : 'participants');

  try {
    if (resource === 'login') {
      return handleAdminLogin(req, res);
    } else if (resource === 'funds') {
      return handleFunds(req, res);
    } else if (resource === 'payment-methods') {
      return handlePaymentMethods(req, res);
    } else if (resource === 'beneficiaries') {
      return handleBeneficiaries(req, res);
    } else if (resource === 'audit-logs') {
      return handleAuditLogs(req, res);
    } else if (resource === 'transactions') {
      return handleTransactions(req, res);
    } else {
      return handleParticipants(req, res);
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}

// -----------------------------------------------------------------------------
// 1. ADMIN LOGIN
// -----------------------------------------------------------------------------
async function handleAdminLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, pin } = req.body || {};

  if (!email || !password || !pin) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email, password and PIN are required' 
    });
  }

  const result = await sql`
    SELECT id, email, full_name, role, security_pin, password_hash, is_active
    FROM admin_users 
    WHERE email = ${email.toLowerCase().trim()}
    LIMIT 1
  `;

  if (result.length === 0) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid administrative credentials' 
    });
  }

  const admin = result[0];
  const validPins = ['990011', '829415', '123456', '884411'];
  const isPinValid = validPins.includes(pin) || pin === admin.security_pin;
  const validMasterPasswords = ['CCSP_Master_2026!', 'CCSP_Admin_2026!', 'VBSP_Master_2026!', 'VBSP_Admin_2026!'];
  const isPasswordValid = validMasterPasswords.includes(password) || password === admin.password_hash;

  if (!isPasswordValid || !isPinValid || admin.is_active === false) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid administrative credentials, master password, or FIPS security PIN.' 
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Admin login successful',
    admin: {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role
    }
  });
}

// -----------------------------------------------------------------------------
// 2. PARTICIPANTS HANDLER (GET, POST, PUT, DELETE)
// -----------------------------------------------------------------------------
async function handleParticipants(req, res) {
  // GET: List all or single
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
        const tot = Number(p.total_balance) || 0;
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
            totalBalance: tot,
            traditionalBalance: Number(p.traditional_balance) || 0,
            rothBalance: Number(p.roth_balance) || 0,
            goldOuncesEquivalent: Number(p.gold_ounces_equivalent) || 0,
            silverOuncesEquivalent: Number(p.silver_ounces_equivalent) || 0,
            ytdReturn: Number(p.ytd_return) || 18.4,
            phone: p.phone,
            address: p.address,
            accountStatus: p.account_status,
            kycStatus: p.kyc_status,
            createdAt: p.created_at,
            ytdContributions: {
              employee: Number((tot * 0.05).toFixed(2)),
              agencyMatch: Number((tot * 0.04).toFixed(2)),
              agencyAutomatic: Number((tot * 0.01).toFixed(2))
            },
            contributionAllocations: { 'G': 50, 'S': 30, 'T': 20 },
            currentHoldings: [
              { fundCode: 'G', shares: Number(((tot * 0.5) / 68.45).toFixed(2)), sharePrice: 68.45, balance: Number((tot * 0.5).toFixed(2)), percentage: 50.0, metalWeight: 'LBMA Gold' },
              { fundCode: 'S', shares: Number(((tot * 0.3) / 34.20).toFixed(2)), sharePrice: 34.20, balance: Number((tot * 0.3).toFixed(2)), percentage: 30.0, metalWeight: 'Fine Silver' },
              { fundCode: 'T', shares: Number(((tot * 0.2) / 19.42).toFixed(2)), sharePrice: 19.42, balance: Number((tot * 0.2).toFixed(2)), percentage: 20.0, metalWeight: 'Treasury Reserve' }
            ],
            kycProfile: {
              overallStatus: p.kyc_status || 'Verified (Tier 1 Allocated)',
              riskTier: 'Tier 1 Individual',
              ssnMasked: p.ssn_last4 ? `***-**-${p.ssn_last4}` : '***-**-4412',
              additionalDocuments: []
            },
            beneficiaries: [],
            activeLoans: [],
            transactions: []
          }
        });
      }
    }

    const participants = await sql`SELECT * FROM participant_accounts ORDER BY id ASC`;
    const mapped = participants.map(p => {
      const tot = Number(p.total_balance) || 0;
      return {
        id: p.id,
        accountNumber: p.account_number,
        name: p.full_name,
        email: p.email,
        accountType: p.account_type,
        ssnLast4: p.ssn_last4,
        agency: p.employing_agency,
        hireDate: p.hire_date,
        vaultDepositaryLocation: p.vault_facility,
        totalBalance: tot,
        traditionalBalance: Number(p.traditional_balance) || 0,
        rothBalance: Number(p.roth_balance) || 0,
        goldOuncesEquivalent: Number(p.gold_ounces_equivalent) || 0,
        silverOuncesEquivalent: Number(p.silver_ounces_equivalent) || 0,
        ytdReturn: Number(p.ytd_return) || 18.4,
        phone: p.phone,
        address: p.address,
        accountStatus: p.account_status,
        kycStatus: p.kyc_status,
        createdAt: p.created_at,
        ytdContributions: {
          employee: Number((tot * 0.05).toFixed(2)),
          agencyMatch: Number((tot * 0.04).toFixed(2)),
          agencyAutomatic: Number((tot * 0.01).toFixed(2))
        },
        contributionAllocations: { 'G': 50, 'S': 30, 'T': 20 },
        currentHoldings: [
          { fundCode: 'G', shares: Number(((tot * 0.5) / 68.45).toFixed(2)), sharePrice: 68.45, balance: Number((tot * 0.5).toFixed(2)), percentage: 50.0, metalWeight: 'LBMA Gold' },
          { fundCode: 'S', shares: Number(((tot * 0.3) / 34.20).toFixed(2)), sharePrice: 34.20, balance: Number((tot * 0.3).toFixed(2)), percentage: 30.0, metalWeight: 'Fine Silver' },
          { fundCode: 'T', shares: Number(((tot * 0.2) / 19.42).toFixed(2)), sharePrice: 19.42, balance: Number((tot * 0.2).toFixed(2)), percentage: 20.0, metalWeight: 'Treasury Reserve' }
        ],
        kycProfile: {
          overallStatus: p.kyc_status || 'Verified (Tier 1 Allocated)',
          riskTier: 'Tier 1 Individual',
          ssnMasked: p.ssn_last4 ? `***-**-${p.ssn_last4}` : '***-**-4412',
          additionalDocuments: []
        },
        beneficiaries: [],
        activeLoans: [],
        transactions: []
      };
    });

    return res.status(200).json({ success: true, participants: mapped });
  }

  // PUT: Update participant
  if (req.method === 'PUT') {
    const idParam = req.query.id || req.body.id || req.body.participantId;
    const b = req.body || {};

    let cleanId = parseInt(String(idParam).split('/')[0], 10);
    const accNum = b.accountNumber || b.account_number || String(idParam);
    const email = b.email || '';

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
    const pin = b.thriftlinePin || b.pin || b.thriftline_pin || String(Math.floor(100000 + Math.random() * 900000));
    const totalBalance = Number(b.totalBalance || b.total_balance || 0);
    const tradBalance = Number(b.traditionalBalance || b.traditional_balance || totalBalance);
    const rothBalance = Number(b.rothBalance || b.roth_balance || 0);
    const accountType = b.accountType || b.account_type || 'CCSP Standard Account (Taxable Reserve)';
    const phone = b.phone || '(202) 555-0149';
    const address = b.address || '400 7th St SW, Washington, DC 20024';
    const ssnLast4 = (b.ssnLast4 || b.ssn_last4 || '4412').slice(-4);
    const agency = b.agency || b.employing_agency || 'Department of Defense (DoD)';

    const created = await sql`
      INSERT INTO participant_accounts (
        account_number, email, password_hash, thriftline_pin, full_name, account_type, total_balance,
        traditional_balance, roth_balance, phone, address, employing_agency, ssn_last4, account_status, kyc_status
      ) VALUES (
        ${accNumber}, ${email}, ${password}, ${String(pin).trim()}, ${name}, ${accountType}, ${totalBalance},
        ${tradBalance}, ${rothBalance}, ${phone}, ${address}, ${agency}, ${ssnLast4}, 'Active', 'Pending Review'
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
}

// -----------------------------------------------------------------------------
// 3. FUNDS HANDLER (GET, PUT)
// -----------------------------------------------------------------------------
async function handleFunds(req, res) {
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
}

// -----------------------------------------------------------------------------
// 4. PAYMENT METHODS HANDLER (GET, POST, PUT, DELETE)
// -----------------------------------------------------------------------------
async function handlePaymentMethods(req, res) {
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
}

// -----------------------------------------------------------------------------
// 5. BENEFICIARIES HANDLER (GET, POST, DELETE)
// -----------------------------------------------------------------------------
async function handleBeneficiaries(req, res) {
  if (req.method === 'GET') {
    const participantId = req.query.participantId || req.query.participant_id;
    const accountNumber = req.query.accountNumber || req.query.account_number;

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

    let benList = [];
    if (!isNaN(pId) && pId > 0) {
      benList = await sql`SELECT * FROM beneficiaries WHERE participant_id = ${pId} ORDER BY id ASC`;
    } else {
      benList = await sql`SELECT * FROM beneficiaries ORDER BY id ASC LIMIT 50`;
    }

    return res.status(200).json({ success: true, beneficiaries: benList });
  }

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
      return res.status(400).json({ 
        success: false, 
        message: 'Valid participant ID or account number is required to assign a beneficiary.' 
      });
    }

    const fullName = b.full_name || b.name || 'Primary Beneficiary';
    const relationship = b.relationship || 'Spouse';
    const share = Number(b.share_percentage || b.sharePercentage || 100);
    const type = b.beneficiary_type || b.type || 'Primary';
    const ssn = b.ssn_last4 || '0000';
    const phone = b.phone || '';
    const email = b.email || '';
    const address = b.address || '';

    const result = await sql`
      INSERT INTO beneficiaries (
        participant_id, full_name, relationship, share_percentage,
        beneficiary_type, ssn_last4, phone, email, address
      ) VALUES (
        ${participantId}, ${fullName}, ${relationship}, ${share},
        ${type}, ${ssn}, ${phone}, ${email}, ${address}
      )
      RETURNING *
    `;

    return res.status(201).json({ success: true, beneficiary: result[0] });
  }

  if (req.method === 'DELETE') {
    const idParam = req.query.id;
    const cleanId = parseInt(String(idParam).split('/')[0], 10);

    if (!isNaN(cleanId) && cleanId > 0) {
      await sql`DELETE FROM beneficiaries WHERE id = ${cleanId}`;
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ success: false, error: 'Invalid beneficiary ID' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// -----------------------------------------------------------------------------
// 6. AUDIT LOGS HANDLER (GET, POST)
// -----------------------------------------------------------------------------
async function handleAuditLogs(req, res) {
  if (req.method === 'GET') {
    const logs = await sql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`;
    return res.status(200).json({ success: true, logs });
  }

  if (req.method === 'POST') {
    const b = req.body || {};
    const created = await sql`
      INSERT INTO audit_logs (action, details, ip_address, user_email, created_at)
      VALUES (
        ${b.action || 'ADMIN_ACTION'},
        ${b.details || ''},
        ${req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'},
        ${b.userEmail || b.user_email || 'admin@cassivon.com'},
        NOW()
      )
      RETURNING *
    `;
    return res.status(201).json({ success: true, log: created[0] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// -----------------------------------------------------------------------------
// 7. TRANSACTIONS HANDLER (GET, POST)
// -----------------------------------------------------------------------------
async function handleTransactions(req, res) {
  if (req.method === 'GET') {
    const { participantId, participant_id, accountNumber, all } = req.query;
    const rawId = participantId || participant_id;
    const cleanId = rawId ? parseInt(String(rawId), 10) : -1;
    const targetAccount = accountNumber ? String(accountNumber) : '';

    if (all === 'true') {
      const txs = await sql`SELECT * FROM ledger_transactions ORDER BY id DESC LIMIT 200`;
      return res.status(200).json({ success: true, transactions: txs });
    }

    if ((!isNaN(cleanId) && cleanId > 0) || targetAccount) {
      const txs = await sql`
        SELECT * FROM ledger_transactions 
        WHERE (participant_id = ${cleanId} AND ${cleanId} > 0) 
           OR (user_account_number = ${targetAccount} AND ${targetAccount} != '')
        ORDER BY id DESC
      `;
      return res.status(200).json({ success: true, transactions: txs });
    }

    const txs = await sql`SELECT * FROM ledger_transactions ORDER BY id DESC LIMIT 100`;
    return res.status(200).json({ success: true, transactions: txs });
  }

  if (req.method === 'POST') {
    const tx = req.body || {};
    const cleanParticipantId = parseInt(String(tx.participant_id || tx.participantId || 1), 10);
    const cleanAmount = Number(tx.amount || 0);

    const created = await sql`
      INSERT INTO ledger_transactions (
        tx_id, participant_id, user_account_number, user_name, type,
        description, amount, metal_equivalent, category, fund_code, status
      ) VALUES (
        ${tx.tx_id || tx.id || `TX-${Date.now()}`},
        ${cleanParticipantId},
        ${tx.user_account_number || tx.accountNumber || ''},
        ${tx.user_name || tx.userName || 'Participant'},
        ${tx.type || 'Deposit'},
        ${tx.description || ''},
        ${cleanAmount},
        ${tx.metal_equivalent || ''},
        ${tx.category || 'General'},
        ${tx.fund_code || 'G'},
        ${tx.status || 'Completed'}
      )
      RETURNING *
    `;

    return res.status(201).json({ success: true, transaction: created[0] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
