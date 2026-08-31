import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // GET - Fetch KYC documents
    if (req.method === 'GET') {
      const { participantId, all } = req.query;

      if (all === 'true') {
        // Admin: get all documents
        const result = await sql`
          SELECT k.*, p.full_name, p.account_number, p.email
          FROM kyc_documents k
          LEFT JOIN participant_accounts p ON k.participant_id = p.id
          ORDER BY k.uploaded_at DESC
        `;
        return res.status(200).json({ success: true, documents: result });
      }

      if (participantId) {
        const result = await sql`
          SELECT * FROM kyc_documents 
          WHERE participant_id = ${Number(participantId)}
          ORDER BY uploaded_at DESC
        `;
        return res.status(200).json({ success: true, documents: result });
      }

      return res.status(400).json({ success: false, message: 'participantId or all=true required' });
    }

    // POST - Upload a new document
    if (req.method === 'POST') {
      const { participantId, documentType, fileName, fileData } = req.body;

      if (!participantId || !documentType) {
        return res.status(400).json({ 
          success: false, 
          message: 'participantId and documentType are required' 
        });
      }

      const result = await sql`
        INSERT INTO kyc_documents (
          participant_id, 
          document_type, 
          file_name, 
          file_data, 
          status
        ) VALUES (
          ${Number(participantId)},
          ${documentType},
          ${fileName || ''},
          ${fileData || ''},
          'Pending Review'
        )
        RETURNING *
      `;

      return res.status(201).json({ 
        success: true, 
        message: 'Document uploaded successfully',
        document: result[0]
      });
    }

    // PUT - Admin updates document status
    if (req.method === 'PUT') {
      const { documentId, status, adminNotes, reviewedBy } = req.body;

      if (!documentId || !status) {
        return res.status(400).json({ 
          success: false, 
          message: 'documentId and status are required' 
        });
      }

      const result = await sql`
        UPDATE kyc_documents SET
          status = ${status},
          admin_notes = ${adminNotes || ''},
          reviewed_by = ${reviewedBy || 'Admin'},
          reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ${Number(documentId)}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Document status updated',
        document: result[0]
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('KYC API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
}
