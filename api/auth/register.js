import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      fullName, 
      email, 
      password, 
      accountType = 'VBSP Standard Account (Taxable Reserve)' 
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

    const sql = neon(process.env.DATABASE_URL);

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

    // Generate a unique account number
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const randomPart2 = Math.floor(1000 + Math.random() * 9000);
    const accountNumber = `VBSP-${randomPart}-${randomPart2}-${Math.floor(10 + Math.random() * 90)}`;

    // Generate a simple ThriftLine PIN
    const thriftlinePin = String(Math.floor(100000 + Math.random() * 900000));

    // Insert new participant
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
        roth_balance
      ) VALUES (
        ${accountNumber},
        ${email.toLowerCase().trim()},
        ${password},
        ${thriftlinePin},
        ${fullName.trim()},
        ${accountType},
        0.00,
        0.00,
        0.00
      )
      RETURNING id, account_number, email, full_name, account_type, thriftline_pin, total_balance
    `;

    const newUser = result[0];

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        account_number: newUser.account_number,
        email: newUser.email,
        full_name: newUser.full_name,
        account_type: newUser.account_type,
        thriftline_pin: newUser.thriftline_pin,
        total_balance: newUser.total_balance
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
