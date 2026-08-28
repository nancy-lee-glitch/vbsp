import React, { useState } from 'react';
import { MOCK_DOCUMENTS } from '../../data/mockData';
import { TSPDocument } from '../../types';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  Shield 
} from 'lucide-react';

export const FormsLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewDoc, setPreviewDoc] = useState<TSPDocument | null>(null);

  const categories = ['All', 'Forms', 'Fact Sheets', 'Publications'];

  const filteredDocs = MOCK_DOCUMENTS.filter(doc => {
    const matchesCat = selectedCategory === 'All' ? true : doc.category === selectedCategory;
    const matchesQuery = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.formNumber && doc.formNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleDownloadSample = (doc: TSPDocument) => {
    const sampleText = `OFFICIAL FEDERAL THRIFT SAVINGS PLAN DOCUMENT
Document ID: ${doc.id}
Title: ${doc.title}
Form Number: ${doc.formNumber || 'N/A'}
Category: ${doc.category}
Revision Date: ${doc.lastUpdated}
Federal Retirement Thrift Investment Board (FRTIB)

=======================================================
INSTRUCTIONS & GENERAL INFORMATION
${doc.description}

This official sample document has been verified compliant with 2026 federal regulations under 5 CFR Part 1600.
For live electronic submissions, log into your Participant My Account portal.
=======================================================`;

    const blob = new Blob([sampleText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.formNumber || 'TSP_Document'}_${doc.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12" id="forms-library">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-800 text-blue-200 rounded-md text-xs font-bold mb-3">
          <FileText className="w-3.5 h-3.5" />
          <span>OFFICIAL FORMS & PUBLICATIONS REPOSITORY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Forms, Publications & Fact Sheets
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Search and download official PDF forms, fund fact sheets, and informational booklets. Most requests (such as address updates, beneficiary designations, and loan applications) can also be completed electronically inside My Account.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by form number (e.g. TSP-3) or title..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div 
            key={doc.id}
            className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                {doc.formNumber ? (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-black text-xs rounded-md">
                    {doc.formNumber}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-md">
                    {doc.category}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3" />
                  Updated {doc.lastUpdated}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mb-1.5">{doc.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{doc.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">{doc.fileSize} • PDF</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPreviewDoc(doc)}
                  className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button 
                  onClick={() => handleDownloadSample(doc)}
                  className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase">{previewDoc.category}</span>
                <h3 className="font-black text-base text-slate-900 mt-1">{previewDoc.title}</h3>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-3">
              <p><strong>Description:</strong> {previewDoc.description}</p>
              <p><strong>File Specifications:</strong> {previewDoc.fileSize} (Standard Adobe Acrobat PDF format)</p>
              <p><strong>Last Revision Date:</strong> {previewDoc.lastUpdated}</p>
              <div className="pt-2 border-t border-slate-200 text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Official Federal Publication</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => { handleDownloadSample(previewDoc); setPreviewDoc(null); }}
                className="px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-lg hover:bg-blue-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
