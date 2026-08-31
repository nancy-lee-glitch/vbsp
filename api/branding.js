import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // GET - Fetch current branding
    if (req.method === 'GET') {
      const result = await sql`
        SELECT * FROM site_branding 
        ORDER BY id ASC 
        LIMIT 1
      `;

      if (result.length === 0) {
        return res.status(200).json({
          success: true,
          branding: {
            siteName: 'Vertex Bullion Savings Plan',
            slogan: 'Institutional Sovereign Custody',
            logoUrl: '',
            supportPhone: '',
            supportEmail: '',
            footerText: ''
          }
        });
      }

      const row = result[0];
      return res.status(200).json({
        success: true,
        branding: {
          siteName: row.site_name || 'Vertex Bullion Savings Plan',
          slogan: row.slogan || '',
          logoUrl: row.logo_url || '',
          supportPhone: row.support_phone || '',
          supportEmail: row.support_email || '',
          footerText: row.footer_text || ''
        }
      });
    }

    // POST - Update branding
    if (req.method === 'POST') {
      const { siteName, slogan, logoUrl, supportPhone, supportEmail, footerText } = req.body;

      // Check if a record exists
      const existing = await sql`SELECT id FROM site_branding LIMIT 1`;

      if (existing.length === 0) {
        await sql`
          INSERT INTO site_branding (site_name, slogan, logo_url, support_phone, support_email, footer_text)
          VALUES (
            ${siteName || 'Vertex Bullion Savings Plan'},
            ${slogan || ''},
            ${logoUrl || ''},
            ${supportPhone || ''},
            ${supportEmail || ''},
            ${footerText || ''}
          )
        `;
      } else {
        await sql`
          UPDATE site_branding SET
            site_name = ${siteName || 'Vertex Bullion Savings Plan'},
            slogan = ${slogan || ''},
            logo_url = ${logoUrl || ''},
            support_phone = ${supportPhone || ''},
            support_email = ${supportEmail || ''},
            footer_text = ${footerText || ''},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existing[0].id}
        `;
      }

      return res.status(200).json({
        success: true,
        message: 'Branding updated successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Branding API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
}
