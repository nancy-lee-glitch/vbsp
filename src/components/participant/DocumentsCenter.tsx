import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  FileCheck, 
  Clock, 
  Calendar, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { UserAccount } from '../../types';

interface DocumentsCenterProps {
  user: UserAccount;
}

export const DocumentsCenter: React.FC<DocumentsCenterProps> = ({ user }) => {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; date: string; status: string }[]>([
    { name: 'Marriage_Certificate_Vance.pdf', size: '1.2 MB', date: '2026-06-12', status: 'Approved' },
    { name: 'Home_Purchase_Closing_Disclosure.pdf', size: '3.4 MB', date: '2026-03-01', status: 'Approved' }
  ]);

  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const statements = [
    { title: '2026 Q2 Participant Statement', period: 'Apr 1, 2026 - Jun 30, 2026', size: '240 KB' },
    { title: '2026 Q1 Participant Statement', period: 'Jan 1, 2026 - Mar 31, 2026', size: '235 KB' },
    { title: '2025 Annual Participant Statement', period: 'Jan 1, 2025 - Dec 31, 2025', size: '410 KB' },
    { title: '2025 Form 1099-R (Distributions from Pensions/Annuities)', period: 'Tax Year 2025', size: '180 KB' },
    { title: '2024 Form 1099-R (Distributions from Pensions/Annuities)', period: 'Tax Year 2024', size: '175 KB' }
  ];

  const handleSimulatedDownload = (title: string) => {
    const text = `OFFICIAL FEDERAL THRIFT SAVINGS PLAN STATEMENT
Document: ${title}
Participant Name: ${user.name}
TSP Account Number: ${user.accountNumber}
Employing Agency: ${user.employingAgency}
Total Account Balance: $${user.totalBalance.toLocaleString()}
Traditional Balance: $${user.traditionalBalance.toLocaleString()}
Roth Balance: $${user.rothBalance.toLocaleString()}
Current Personal Rate of Return: ${user.ytdReturn}%

Generated: ${new Date().toISOString()}
Federal Retirement Thrift Investment Board (FRTIB)`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newEntry = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        date: new Date().toISOString().split('T')[0],
        status: 'Under Review'
      };
      setUploadedFiles([newEntry, ...uploadedFiles]);
      setUploadSuccess(`Successfully uploaded "${file.name}". Our operations caseworkers will review it within 2 business days.`);
      setTimeout(() => setUploadSuccess(''), 6000);
    }
  };

  return (
    <div className="space-y-6 pb-12" id="documents-center">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-blue-800" />
            <h2 className="text-xl font-black text-slate-900">Statements, Tax Forms & Document Upload</h2>
          </div>
          <p className="text-xs text-slate-600">
            Access official quarterly statements, IRS Form 1099-Rs, or securely upload legal documentation (marriage certificates, court orders, loan closing documents).
          </p>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Grid: Statements & Tax Forms / Document Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Official Statements & 1099-R List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Electronic Statements & Tax Reports
          </h3>

          <div className="space-y-3">
            {statements.map((stmt, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{stmt.title}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{stmt.period} • {stmt.size}</div>
                  </div>
                </div>

                <button 
                  onClick={() => handleSimulatedDownload(stmt.title)}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Secure Document Upload Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Submit Required Documentation
            </h3>

            {/* Drag and drop upload zone */}
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-700 bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
              <UploadCloud className="w-10 h-10 text-blue-900 mb-2" />
              <div className="text-xs font-bold text-slate-900">
                Click to browse or drag & drop files
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                PDF, JPG, PNG up to 25MB (Encrypted transmission)
              </p>
              <input 
                type="file" 
                onChange={handleFileUpload}
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </label>

            {/* Uploaded History */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-700">Uploaded Documents History:</div>
              {uploadedFiles.map((f, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 truncate max-w-[180px]">{f.name}</div>
                    <div className="text-[10px] text-slate-500">{f.size} • {f.date}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    f.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
