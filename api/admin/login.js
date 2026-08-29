import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, pin } = req.body;

    if (!email || !password || !pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password and PIN are required' 
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check admin in the database
    const result = await sql`
      SELECT id, email, full_name, role, security_pin, is_active
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

    // For now we do a simple check (we will improve password security later)
    // Current seed password is related to VBSP_Admin_2026! and PIN 990011
    const validPins = ['990011', '829415', '123456'];
    const isPinValid = validPins.includes(pin);
    
    // Temporary simple password check (we will replace with proper bcrypt later)
    const isPasswordValid = password === 'VBSP_Master_2026!' || password === 'VBSP_Admin_2026!';

    if (!isPasswordValid || !isPinValid || !admin.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid administrative credentials, master password, or FIPS security PIN.' 
      });
    }

    // Success
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

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
}
