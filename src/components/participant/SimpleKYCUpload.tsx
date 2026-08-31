import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Clock, AlertCircle, Eye } from 'lucide-react';
import { UserAccount } from '../../types';

interface SimpleKYCUploadProps {
  user: UserAccount;
}

interface KycDoc {
  id: number;
  document_type: string;
  file_name: string;
  status: string;
  uploaded_at: string;
  admin_notes?: string;
}

export const SimpleKYCUpload: React.FC<SimpleKYCUploadProps> = ({ user }) => {
  const [documents, setDocuments] = useState<KycDoc[]>([]);
  const [documentType, setDocumentType] = useState('ssn_card');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load existing documents
  useEffect(() => {
    loadDocuments();
  }, [user.id]);

  const loadDocuments = async () => {
    try {
      const res = await fetch(`/api/kyc?participantId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileData || !documentType) {
      setError('Please select a document type and choose a file.');
      return;
    }

    setIsUploading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: user.id,
          documentType,
          fileName,
          fileData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Document uploaded successfully. Status: Pending Review');
        setFileName('');
        setFileData('');
        loadDocuments();
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Unable to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Verified') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (status === 'Rejected') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#005ea2]" />
          Identity Verification (KYC)
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Upload your identification documents for verification.
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full border border-slate-300 rounded-xs px-3 py-2 text-sm"
          >
            <option value="ssn_card">Social Security Card</option>
            <option value="driver_license_front">Driver’s License (Front)</option>
            <option value="driver_license_back">Driver’s License (Back)</option>
            <option value="passport">Passport</option>
            <option value="proof_of_address">Proof of Address</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Choose File</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="w-full text-sm"
          />
          {fileName && (
            <p className="text-xs text-slate-500 mt-1">Selected: {fileName}</p>
          )}
        </div>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {message && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={isUploading || !fileData}
          className="w-full py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-sm rounded-xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            'Uploading...'
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Document
            </>
          )}
        </button>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">Your Uploaded Documents</h3>

        {documents.length === 0 ? (
          <p className="text-sm text-slate-500">No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-slate-200 rounded-sm p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {doc.document_type.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="text-xs text-slate-500">{doc.file_name}</div>
                <div className="text-xs text-slate-400">
                  {new Date(doc.uploaded_at).toLocaleString()}
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-xs border ${getStatusColor(doc.status)}`}>
                {doc.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
