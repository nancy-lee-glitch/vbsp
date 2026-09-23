import sql from '../db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      fullName, 
      email, 
      password, 
      accountType = 'CCSP Standard Account (Taxable Reserve)',
      accountNumber,
      pin,
      thriftlinePin: reqThriftlinePin,
      phone,
      address,
      employingAgency,
      ssnLast4
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email and password are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters' 
      });
    }

    // Check if email already exists
    const existing = await sql`
      SELECT id FROM participant_accounts 
      WHERE email = ${email.toLowerCase().trim()}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists' 
      });
    }

    // Determine account number
    let targetAccountNum = accountNumber;
    if (!targetAccountNum || !targetAccountNum.trim()) {
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const randomPart2 = Math.floor(1000 + Math.random() * 9000);
      targetAccountNum = `CCSP-${randomPart}-${randomPart2}-${Math.floor(10 + Math.random() * 90)}`;
    }

    // Determine exact ThriftLine PIN: ALWAYS prioritize the PIN chosen by the user
    const rawPin = pin || reqThriftlinePin;
    const targetPin = (rawPin && String(rawPin).trim().length > 0)
      ? String(rawPin).trim()
      : String(Math.floor(100000 + Math.random() * 900000));

    const targetPhone = phone || '(202) 555-0149';
    const targetAddress = address || '400 7th St SW, Washington, DC 20024';
    const targetAgency = employingAgency || 'Department of Defense (DoD)';
    const targetSsn = (ssnLast4 || '4412').slice(-4);

    // Insert new participant with exact ThriftLine PIN
    const result = await sql`
      INSERT INTO participant_accounts (
        account_number, 
        email, 
        password_hash, 
        thriftline_pin, 
        full_name, 
        account_type,
        total_balance,
        traditional_balance,
        roth_balance,
        phone,
        address,
        employing_agency,
        ssn_last4,
        account_status,
        kyc_status
      ) VALUES (
        ${targetAccountNum.trim()},
        ${email.toLowerCase().trim()},
        ${password.trim()},
        ${targetPin},
        ${fullName.trim()},
        ${accountType},
        0.00,
        0.00,
        0.00,
        ${targetPhone},
        ${targetAddress},
        ${targetAgency},
        ${targetSsn},
        'Active',
        'Pending Review'
      )
      RETURNING id, account_number, email, full_name, account_type, thriftline_pin, total_balance, traditional_balance, roth_balance, phone, address, employing_agency, ssn_last4, account_status, kyc_status
    `;

    const newUser = result[0];

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        account_number: newUser.account_number,
        accountNumber: newUser.account_number,
        email: newUser.email,
        full_name: newUser.full_name,
        name: newUser.full_name,
        account_type: newUser.account_type,
        accountType: newUser.account_type,
        thriftline_pin: newUser.thriftline_pin,
        thriftlinePin: newUser.thriftline_pin,
        total_balance: Number(newUser.total_balance) || 0,
        totalBalance: Number(newUser.total_balance) || 0,
        phone: newUser.phone,
        address: newUser.address,
        employingAgency: newUser.employing_agency,
        ssnLast4: newUser.ssn_last4,
        accountStatus: newUser.account_status,
        kycStatus: newUser.kyc_status
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
}
