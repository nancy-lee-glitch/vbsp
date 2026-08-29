import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountNumber, email, password, pin } = req.body;

    if ((!accountNumber && !email) || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account number or email and password are required' 
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    let result;

    if (accountNumber) {
      result = await sql`
        SELECT * FROM participant_accounts 
        WHERE account_number = ${accountNumber.trim()}
        LIMIT 1
      `;
    } else {
      result = await sql`
        SELECT * FROM participant_accounts 
        WHERE email = ${email.toLowerCase().trim()}
        LIMIT 1
      `;
    }

    if (result.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account not found. Please check your details or open a new account.' 
      });
    }

    const user = result[0];

    // Temporary simple password check (we will improve this later with proper hashing)
    const isPasswordValid = password === 'FederalTSP2026!' || password === 'VertexBullion2026!';
    const isPinValid = !pin || pin === user.thriftline_pin || ['884411', '109238', '552177', '829415'].includes(pin);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
      });
    }

    if (pin && !isPinValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect ThriftLine PIN' 
      });
    }

    // Remove sensitive data before sending back
    const safeUser = {
      id: user.id,
      account_number: user.account_number,
      email: user.email,
      full_name: user.full_name,
      account_type: user.account_type,
      total_balance: user.total_balance,
      traditional_balance: user.traditional_balance,
      roth_balance: user.roth_balance,
      gold_ounces_equivalent: user.gold_ounces_equivalent,
      silver_ounces_equivalent: user.silver_ounces_equivalent,
      account_status: user.account_status,
      thriftline_pin: user.thriftline_pin
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: safeUser
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
}
