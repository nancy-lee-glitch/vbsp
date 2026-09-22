import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: List documents
    if (req.method === 'GET') {
      const participantId = req.query.participantId || req.query.participant_id;
      const accountNumber = req.query.accountNumber || req.query.account_number;

      let docs;
      if (participantId || accountNumber) {
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

        if (!isNaN(pId) && pId > 0) {
          docs = await sql`
            SELECT * FROM user_documents 
            WHERE participant_id = ${pId} 
            ORDER BY created_at DESC
          `;
        } else if (accountNumber) {
          docs = await sql`
            SELECT * FROM user_documents 
            WHERE user_account_number = ${String(accountNumber)} 
            ORDER BY created_at DESC
          `;
        } else {
          docs = await sql`SELECT * FROM user_documents ORDER BY created_at DESC`;
        }
      } else {
        docs = await sql`SELECT * FROM user_documents ORDER BY created_at DESC`;
      }

      return res.status(200).json({ success: true, documents: docs });
    }

    // POST: Upload document
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
        const fallback = await sql`SELECT id FROM participant_accounts ORDER BY id ASC LIMIT 1`;
        participantId = fallback.length > 0 ? fallback[0].id : 1;
      }

      const docId = b.doc_id || `DOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const title = b.document_title || b.title || b.file_name || 'Legal Document';
      const docType = b.document_type || b.category || 'General';
      const fileName = b.file_name || 'document.pdf';
      const fileData = b.file_data || b.file_url || '';
      const fileSize = b.file_size || '1.2 MB';
      const userName = b.user_name || 'Participant';

      const result = await sql`
        INSERT INTO user_documents (
          doc_id, participant_id, user_account_number, user_name,
          document_title, title, document_type, category, file_name,
          file_data, file_size, status
        ) VALUES (
          ${docId}, ${participantId}, ${userAcc}, ${userName},
          ${title}, ${title}, ${docType}, ${docType}, ${fileName},
          ${fileData}, ${fileSize}, 'Pending'
        )
        RETURNING *
      `;

      return res.status(201).json({ success: true, document: result[0] });
    }

    // PUT: Update document status (Approve / Reject)
    if (req.method === 'PUT') {
      const docParam = req.query.id || req.body.id || req.body.docId;
      const { status, adminNotes, admin_notes, complianceNotes } = req.body || {};
      const note = adminNotes || admin_notes || complianceNotes || '';

      if (!docParam) {
        return res.status(400).json({ success: false, error: 'Document ID is required' });
      }

      const cleanId = parseInt(String(docParam).split('/')[0], 10);
      const strId = String(docParam);

      let updated;
      if (!isNaN(cleanId) && cleanId > 0) {
        updated = await sql`
          UPDATE user_documents SET
            status = ${status || 'Approved'},
            admin_notes = COALESCE(${note || null}, admin_notes),
            updated_at = NOW()
          WHERE id = ${cleanId} OR doc_id = ${strId}
          RETURNING *
        `;
      } else {
        updated = await sql`
          UPDATE user_documents SET
            status = ${status || 'Approved'},
            admin_notes = COALESCE(${note || null}, admin_notes),
            updated_at = NOW()
          WHERE doc_id = ${strId}
          RETURNING *
        `;
      }

      if (!updated || updated.length === 0) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      return res.status(200).json({ success: true, document: updated[0] });
    }

    // DELETE: Remove document
    if (req.method === 'DELETE') {
      const docParam = req.query.id;
      const cleanId = parseInt(String(docParam).split('/')[0], 10);
      const strId = String(docParam);

      if (!isNaN(cleanId) && cleanId > 0) {
        await sql`DELETE FROM user_documents WHERE id = ${cleanId} OR doc_id = ${strId}`;
      } else {
        await sql`DELETE FROM user_documents WHERE doc_id = ${strId}`;
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/documents:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
