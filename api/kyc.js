import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Helper to resolve participant integer ID strictly
    const resolveParticipantId = async (input, userAcc, userEmail) => {
      let pId = parseInt(String(input), 10);
      if (!isNaN(pId) && pId > 0 && pId < 10000000) {
        const found = await sql`SELECT id FROM participant_accounts WHERE id = ${pId} LIMIT 1`;
        if (found.length > 0) return found[0].id;
      }
      const acc = userAcc || (typeof input === 'string' && input.startsWith('CC') ? input : null);
      const em = userEmail || (typeof input === 'string' && input.includes('@') ? input : null);
      if (acc || em) {
        const found = await sql`
          SELECT id FROM participant_accounts 
          WHERE account_number = ${String(acc || '')} OR LOWER(email) = ${String(em || '').toLowerCase()}
          LIMIT 1
        `;
        if (found.length > 0) return found[0].id;
      }
      return 0;
    };

    // GET - Fetch KYC documents
    if (req.method === 'GET') {
      const { participantId, all, accountNumber, email } = req.query;

      if (all === 'true') {
        const result = await sql`
          SELECT k.*, p.full_name, p.account_number, p.email
          FROM kyc_documents k
          LEFT JOIN participant_accounts p ON k.participant_id = p.id
          ORDER BY k.uploaded_at DESC
        `;
        return res.status(200).json({ success: true, documents: result });
      }

      if (participantId || accountNumber || email) {
        const pId = await resolveParticipantId(participantId, accountNumber, email);
        if (pId <= 0) {
          return res.status(200).json({ success: true, documents: [] });
        }
        const result = await sql`
          SELECT * FROM kyc_documents 
          WHERE participant_id = ${pId}
          ORDER BY uploaded_at DESC
        `;
        return res.status(200).json({ success: true, documents: result });
      }

      return res.status(400).json({ success: false, message: 'participantId or all=true required' });
    }

    // POST - Upload a new document
    if (req.method === 'POST') {
      const { participantId, accountNumber, email, documentType, fileName, fileData, doc_type, file_name, file_data } = req.body || {};
      const docType = documentType || doc_type;
      const fName = fileName || file_name || 'id_document.pdf';
      const fData = fileData || file_data || '';

      if (!docType) {
        return res.status(400).json({ 
          success: false, 
          message: 'documentType is required' 
        });
      }

      const pId = await resolveParticipantId(participantId, accountNumber, email);
      if (pId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Unable to identify participant account for KYC document upload'
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
          ${pId},
          ${docType},
          ${fName},
          ${fData},
          'Pending Review'
        )
        RETURNING *
      `;

      // Update participant's overall KYC status to Pending Review if not verified
      await sql`
        UPDATE participant_accounts 
        SET kyc_status = 'Pending Review', updated_at = NOW()
        WHERE id = ${pId} AND kyc_status != 'Verified (Tier 1 Allocated)'
      `;

      return res.status(201).json({ 
        success: true, 
        message: 'Document uploaded successfully',
        document: result[0]
      });
    }

    // PUT - Admin updates document status
    if (req.method === 'PUT') {
      const { documentId, id, status, adminNotes, admin_notes, reviewedBy } = req.body || {};
      const docId = parseInt(documentId || id || req.query.id, 10);
      const newStatus = status || 'Verified';
      const notes = adminNotes || admin_notes || '';

      if (isNaN(docId) || docId <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid documentId is required' 
        });
      }

      const result = await sql`
        UPDATE kyc_documents SET
          status = ${newStatus},
          admin_notes = ${notes},
          reviewed_by = ${reviewedBy || 'Admin'},
          reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ${docId}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      const doc = result[0];

      // If approved/verified, update participant account kyc_status
      if (newStatus === 'Verified' || newStatus === 'Approved') {
        await sql`
          UPDATE participant_accounts SET
            kyc_status = 'Verified (Tier 1 Allocated)',
            account_status = 'ACTIVE',
            updated_at = NOW()
          WHERE id = ${doc.participant_id}
        `;

        // Send confirmation message to mailbox
        try {
          await sql`
            INSERT INTO messages (
              participant_id, sender_type, sender_name, sender_email,
              subject, body, category, is_read
            ) VALUES (
              ${doc.participant_id},
              'admin',
              'Cassivon Depository Compliance Bureau',
              'compliance@cassivon.com',
              'Identification Document Verification Approved',
              ${`Your identification document (${doc.document_type}) has been officially verified and approved. Your vault account status is active and verified for allocated physical bullion custody.`},
              'official',
              false
            )
          `;
        } catch (mErr) {
          console.warn('Mail write notice:', mErr);
        }
      } else if (newStatus === 'Rejected' || newStatus === 'Action Required') {
        await sql`
          UPDATE participant_accounts SET
            kyc_status = 'Action Required',
            updated_at = NOW()
          WHERE id = ${doc.participant_id}
        `;
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Document status updated',
        document: doc
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/kyc:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}
