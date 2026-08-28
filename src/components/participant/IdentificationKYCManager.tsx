import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  Trash2, 
  CreditCard, 
  Globe, 
  Lock, 
  Camera, 
  FileUp, 
  Building2, 
  X, 
  Check, 
  Info,
  Download,
  Fingerprint
} from 'lucide-react';
import { 
  UserAccount, 
  IdentificationDocument, 
  IdentificationDocType, 
  KYCVerificationProfile 
} from '../../types';

interface IdentificationKYCManagerProps {
  user: UserAccount;
  onUpdateUser: (updatedUser: UserAccount, message: string) => void;
}

export const IdentificationKYCManager: React.FC<IdentificationKYCManagerProps> = ({
  user,
  onUpdateUser
}) => {
  // Default KYC profile if none exists
  const kycProfile: KYCVerificationProfile = user.kycProfile || {
    overallStatus: 'Verified (Tier 1 Allocated)',
    verifiedDate: '2026-01-15',
    riskTier: 'Tier 1 Individual',
    ssnMasked: '***-**-4412',
    ssnDocument: {
      id: 'doc-ssn-default',
      type: 'ssn_card',
      title: 'Social Security Card (SSN Verification)',
      documentNumberMasked: '***-**-4412',
      issuingAuthority: 'Social Security Administration (SSA)',
      fileName: 'SSA_Card_Vance_M.pdf',
      fileSize: '1.4 MB',
      uploadedAt: '2026-01-14 10:22 AM',
      status: 'Verified',
      notes: 'SSN verified against federal records.'
    },
    driverLicenseFront: {
      id: 'doc-dl-front-default',
      type: 'driver_license_front',
      title: "Driver's License (Front Photo ID)",
      documentNumberMasked: 'VA-D8849****',
      issuingAuthority: 'Commonwealth of Virginia DMV',
      expirationDate: '2028-11-15',
      fileName: 'VA_DriverLicense_Front.jpg',
      fileSize: '2.8 MB',
      uploadedAt: '2026-01-14 10:25 AM',
      status: 'Verified'
    },
    driverLicenseBack: {
      id: 'doc-dl-back-default',
      type: 'driver_license_back',
      title: "Driver's License (Back Barcode)",
      documentNumberMasked: 'VA-D8849****',
      issuingAuthority: 'Commonwealth of Virginia DMV',
      expirationDate: '2028-11-15',
      fileName: 'VA_DriverLicense_Back.jpg',
      fileSize: '2.1 MB',
      uploadedAt: '2026-01-14 10:26 AM',
      status: 'Verified'
    },
    passportDocument: {
      id: 'doc-passport-default',
      type: 'passport',
      title: 'International Passport (Photo Identification Page)',
      documentNumberMasked: 'US-P9942****',
      issuingAuthority: 'U.S. Department of State',
      expirationDate: '2031-06-20',
      fileName: 'US_Passport_Booklet_Vance.jpg',
      fileSize: '3.6 MB',
      uploadedAt: '2026-01-14 10:30 AM',
      status: 'Verified',
      notes: 'Allocated precious metal international physical delivery authorized.'
    },
    additionalDocuments: [
      {
        id: 'doc-poa-default',
        type: 'proof_of_address',
        title: 'Proof of Residential Address (Utility Statement)',
        documentNumberMasked: 'UT-9941-88',
        issuingAuthority: 'Potomac Electric Power Company',
        fileName: 'Pepco_Utility_Bill_Jan2026.pdf',
        fileSize: '890 KB',
        uploadedAt: '2026-01-14 10:32 AM',
        status: 'Verified'
      }
    ]
  };

  // Upload Modal State
  const [activeUploadType, setActiveUploadType] = useState<IdentificationDocType | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issuingAuth, setIssuingAuth] = useState('');
  const [expDate, setExpDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Document Viewer Lightbox Modal
  const [viewingDoc, setViewingDoc] = useState<IdentificationDocument | null>(null);

  // Success Notification
  const [notification, setNotification] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openUploadModal = (type: IdentificationDocType, defaultTitle: string, defaultAuthority = '') => {
    setActiveUploadType(type);
    setUploadTitle(defaultTitle);
    setIssuingAuth(defaultAuthority);
    setDocNumber('');
    setExpDate('');
    setSelectedFile(null);
  };

  const handleFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        dataUrl: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUploadType) return;

    setIsProcessing(true);

    setTimeout(() => {
      const newDoc: IdentificationDocument = {
        id: `doc-${Date.now()}`,
        type: activeUploadType,
        title: uploadTitle || 'Identification Document',
        documentNumberMasked: docNumber ? (docNumber.length > 4 ? `••••${docNumber.slice(-4)}` : docNumber) : undefined,
        issuingAuthority: issuingAuth || 'Government Authority',
        expirationDate: expDate || undefined,
        fileName: selectedFile?.name || `${activeUploadType}_scan.pdf`,
        fileSize: selectedFile?.size || '1.85 MB',
        fileDataUrl: selectedFile?.dataUrl,
        uploadedAt: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: 'Pending Review',
        notes: 'Submitted for Depository Vault Compliance & Assay Verification.'
      };

      const updatedProfile: KYCVerificationProfile = { ...kycProfile };

      if (activeUploadType === 'ssn_card') {
        updatedProfile.ssnDocument = newDoc;
        if (docNumber) {
          updatedProfile.ssnMasked = `***-**-${docNumber.slice(-4)}`;
        }
      } else if (activeUploadType === 'driver_license_front') {
        updatedProfile.driverLicenseFront = newDoc;
      } else if (activeUploadType === 'driver_license_back') {
        updatedProfile.driverLicenseBack = newDoc;
      } else if (activeUploadType === 'passport') {
        updatedProfile.passportDocument = newDoc;
      } else if (activeUploadType === 'proof_of_address') {
        updatedProfile.proofOfAddressDocument = newDoc;
      } else {
        updatedProfile.additionalDocuments = [newDoc, ...(updatedProfile.additionalDocuments || [])];
      }

      const updatedUser: UserAccount = {
        ...user,
        kycProfile: updatedProfile
      };

      onUpdateUser(updatedUser, `Identification document "${uploadTitle}" has been uploaded and queued for depository verification.`);
      setIsProcessing(false);
      setActiveUploadType(null);
      setNotification(`Document "${uploadTitle}" uploaded successfully.`);
      setTimeout(() => setNotification(''), 6000);
    }, 900);
  };

  const getStatusBadge = (status: IdentificationDocument['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Check className="w-3 h-3" />
            <span>Verified</span>
          </span>
        );
      case 'Pending Review':
      case 'Under Vault Assay Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'Action Required':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-900 border border-red-300">
            <AlertCircle className="w-3 h-3" />
            <span>Action Required</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12" id="identification-kyc-manager">
      
      {/* Header & Verification Tier Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-[#112e51] text-[#f2a900] text-xs font-black rounded-md tracking-wider uppercase">
                KYC / AML Vault Compliance
              </span>
              <span className="text-xs text-slate-500 font-semibold">Tier 1 Sovereign Bullion Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Identity Verification & Custody Documents
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-1">
              Federal anti-money laundering (AML) and institutional depository regulations require all bullion plan participants to maintain verified identification on file for vaulted metal custody, physical bar allocations, and tax reporting.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Depository Status</div>
              <div className="text-sm font-black text-emerald-950">{kycProfile.overallStatus}</div>
              <div className="text-[10px] text-emerald-700 font-medium">Last audited: {kycProfile.verifiedDate || 'Jan 2026'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid of Identification Document Upload Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Social Security Card / Taxpayer ID (SSN) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold border border-blue-200">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">1. Social Security Card (SSN)</h3>
                  <p className="text-[11px] text-slate-500">IRS Form 1099-R & Tax Identification</p>
                </div>
              </div>
              {kycProfile.ssnDocument ? getStatusBadge(kycProfile.ssnDocument.status) : (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">Not Uploaded</span>
              )}
            </div>

            {kycProfile.ssnDocument ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">SSN Number on Record:</span>
                  <span className="font-mono font-black text-slate-900">{kycProfile.ssnMasked || kycProfile.ssnDocument.documentNumberMasked || '***-**-4412'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Issuing Authority:</span>
                  <span className="font-bold text-slate-800">{kycProfile.ssnDocument.issuingAuthority || 'Social Security Administration'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">File Attachment:</span>
                  <span className="font-mono text-[11px] text-blue-900 font-bold truncate max-w-[180px]">{kycProfile.ssnDocument.fileName} ({kycProfile.ssnDocument.fileSize})</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  Uploaded: {kycProfile.ssnDocument.uploadedAt}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Please upload a clear scan or photo of your official Social Security card or SSA-1099 statement.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {kycProfile.ssnDocument && (
              <button
                onClick={() => setViewingDoc(kycProfile.ssnDocument!)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>View Document</span>
              </button>
            )}
            <button
              onClick={() => openUploadModal('ssn_card', 'Social Security Card (SSN)', 'Social Security Administration')}
              className="flex-1 py-2 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{kycProfile.ssnDocument ? 'Replace SSN Scan' : 'Upload SSN Card'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Driver's License or Government Photo ID (Front & Back) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center font-bold border border-indigo-200">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">2. Driver's License / State ID</h3>
                  <p className="text-[11px] text-slate-500">Government Photo ID (Front & Back)</p>
                </div>
              </div>
              {kycProfile.driverLicenseFront ? getStatusBadge(kycProfile.driverLicenseFront.status) : (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">Not Uploaded</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Front Side Slot */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Front Photo ID</span>
                  {kycProfile.driverLicenseFront && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {kycProfile.driverLicenseFront ? kycProfile.driverLicenseFront.fileName : 'No file uploaded'}
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      if (kycProfile.driverLicenseFront) {
                        setViewingDoc(kycProfile.driverLicenseFront);
                      } else {
                        openUploadModal('driver_license_front', "Driver's License (Front Side)", 'State DMV / Licensing Agency');
                      }
                    }}
                    className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-800 cursor-pointer flex items-center justify-center gap-1"
                  >
                    {kycProfile.driverLicenseFront ? <Eye className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
                    <span>{kycProfile.driverLicenseFront ? 'Inspect Front' : 'Upload Front'}</span>
                  </button>
                </div>
              </div>

              {/* Back Side Slot */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Back Barcode</span>
                  {kycProfile.driverLicenseBack && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {kycProfile.driverLicenseBack ? kycProfile.driverLicenseBack.fileName : 'No file uploaded'}
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      if (kycProfile.driverLicenseBack) {
                        setViewingDoc(kycProfile.driverLicenseBack);
                      } else {
                        openUploadModal('driver_license_back', "Driver's License (Back Barcode)", 'State DMV / Licensing Agency');
                      }
                    }}
                    className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-800 cursor-pointer flex items-center justify-center gap-1"
                  >
                    {kycProfile.driverLicenseBack ? <Eye className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
                    <span>{kycProfile.driverLicenseBack ? 'Inspect Back' : 'Upload Back'}</span>
                  </button>
                </div>
              </div>
            </div>

            {kycProfile.driverLicenseFront && (
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-4 flex justify-between items-center">
                <span>License: <strong className="text-slate-900 font-mono">{kycProfile.driverLicenseFront.documentNumberMasked || 'VA-D8849****'}</strong></span>
                <span>Exp: <strong className="text-slate-900">{kycProfile.driverLicenseFront.expirationDate || '11/2028'}</strong></span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => openUploadModal('driver_license_front', "Driver's License / State ID (Front)", 'Commonwealth DMV')}
              className="w-full py-2 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Replace Full License (Front & Back)</span>
            </button>
          </div>
        </div>

        {/* Card 3: International Passport Booklet / Sovereign ID */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold border border-amber-200">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">3. International Passport Booklet</h3>
                  <p className="text-[11px] text-slate-500">Cross-Border Vault Delivery & Sovereign Custody</p>
                </div>
              </div>
              {kycProfile.passportDocument ? getStatusBadge(kycProfile.passportDocument.status) : (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">Not Uploaded</span>
              )}
            </div>

            {kycProfile.passportDocument ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Passport Number:</span>
                  <span className="font-mono font-black text-slate-900">{kycProfile.passportDocument.documentNumberMasked || 'US-P9942****'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Issuing Authority:</span>
                  <span className="font-bold text-slate-800">{kycProfile.passportDocument.issuingAuthority || 'U.S. Department of State'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Expiration Date:</span>
                  <span className="font-bold text-slate-900">{kycProfile.passportDocument.expirationDate || '2031-06-20'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">File Scan:</span>
                  <span className="font-mono text-[11px] text-blue-900 font-bold truncate max-w-[180px]">{kycProfile.passportDocument.fileName} ({kycProfile.passportDocument.fileSize})</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Upload a clear image of your passport's photo identification page. Required for Zurich and London vault allocations.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {kycProfile.passportDocument && (
              <button
                onClick={() => setViewingDoc(kycProfile.passportDocument!)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>View Passport</span>
              </button>
            )}
            <button
              onClick={() => openUploadModal('passport', 'International Passport Booklet', 'U.S. Department of State')}
              className="flex-1 py-2 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{kycProfile.passportDocument ? 'Replace Passport' : 'Upload Passport'}</span>
            </button>
          </div>
        </div>

        {/* Card 4: Proof of Residential Address & Supplementary Documents */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold border border-emerald-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">4. Proof of Address / Depository Notice</h3>
                  <p className="text-[11px] text-slate-500">Utility Statement or Certified Depository Letter</p>
                </div>
              </div>
              {kycProfile.proofOfAddressDocument ? getStatusBadge(kycProfile.proofOfAddressDocument.status) : (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">Optional</span>
              )}
            </div>

            {kycProfile.proofOfAddressDocument ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Document Title:</span>
                  <span className="font-bold text-slate-900">{kycProfile.proofOfAddressDocument.title}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Utility / Entity:</span>
                  <span className="font-bold text-slate-800">{kycProfile.proofOfAddressDocument.issuingAuthority || 'Utility Provider'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Attached File:</span>
                  <span className="font-mono text-[11px] text-blue-900 font-bold truncate max-w-[180px]">{kycProfile.proofOfAddressDocument.fileName} ({kycProfile.proofOfAddressDocument.fileSize})</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 mb-4 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Upload a utility bill, residential lease, or bank statement dated within the last 90 days matching your address on file.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {kycProfile.proofOfAddressDocument && (
              <button
                onClick={() => setViewingDoc(kycProfile.proofOfAddressDocument!)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>View File</span>
              </button>
            )}
            <button
              onClick={() => openUploadModal('proof_of_address', 'Proof of Residential Address', 'Utility Provider / Bank')}
              className="flex-1 py-2 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{kycProfile.proofOfAddressDocument ? 'Replace Proof' : 'Upload Proof of Address'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Depository Security & Data Encryption Assurance Box */}
      <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">FIPS 140-3 Cryptographic Depository Protection</div>
            <p className="text-[11px] text-slate-400">
              All uploaded identification documents are encrypted with AES-256-GCM and stored in isolated high-security biometric vault storage.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
          <span>SHA-256 Checksum Verified</span>
        </div>
      </div>

      {/* ========================================================== */}
      {/* UPLOAD DOCUMENT MODAL (DRAG & DROP / FILE SELECTOR) */}
      {/* ========================================================== */}
      {activeUploadType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#112e51] to-[#005ea2] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#f2a900]">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Upload Identification Document</h3>
                  <p className="text-[11px] text-slate-300">{uploadTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveUploadType(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUpload} className="p-6 space-y-4 overflow-y-auto">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Category / Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Document / ID Number</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder={activeUploadType === 'ssn_card' ? 'e.g. 123-45-6789' : 'e.g. D88491024'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issuing Authority / State</label>
                  <input
                    type="text"
                    value={issuingAuth}
                    onChange={(e) => setIssuingAuth(e.target.value)}
                    placeholder="e.g. Virginia DMV, SSA, State Dept"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {activeUploadType !== 'ssn_card' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white"
                  />
                </div>
              )}

              {/* Drag & Drop Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select or Drop Document File (PNG, JPG, PDF, WebP)</label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                    dragActive 
                      ? 'border-[#005ea2] bg-blue-50/80' 
                      : selectedFile 
                      ? 'border-emerald-400 bg-emerald-50/50' 
                      : 'border-slate-300 hover:border-[#005ea2] bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">{selectedFile.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{selectedFile.size} • Ready for encryption</div>
                      {selectedFile.dataUrl.startsWith('data:image') && (
                        <div className="mt-2 max-h-32 overflow-hidden rounded-lg border border-slate-200 mx-auto max-w-[200px]">
                          <img src={selectedFile.dataUrl} alt="Preview" className="w-full h-auto object-cover" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-[#005ea2] flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">
                        Drag and drop your scan or photo here, or <span className="text-[#005ea2] underline">browse</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Supports PDF, PNG, JPG up to 25MB per document
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveUploadType(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Encrypting & Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Submit Document to Depository</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* DOCUMENT VIEWER LIGHTBOX MODAL */}
      {/* ========================================================== */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-[#112e51] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#f2a900]" />
                <div>
                  <h3 className="font-bold text-sm text-white">{viewingDoc.title}</h3>
                  <p className="text-[10px] text-slate-300">File: {viewingDoc.fileName} • {viewingDoc.fileSize}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content View */}
            <div className="p-6 overflow-y-auto space-y-4">
              
              {/* Document Meta Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">STATUS</span>
                  {getStatusBadge(viewingDoc.status)}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">ID NUMBER</span>
                  <span className="font-mono font-bold text-slate-900">{viewingDoc.documentNumberMasked || '••••••••'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">AUTHORITY</span>
                  <span className="font-semibold text-slate-800 truncate block">{viewingDoc.issuingAuthority || 'Official'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">UPLOADED</span>
                  <span className="text-slate-700 text-[11px] block">{viewingDoc.uploadedAt}</span>
                </div>
              </div>

              {/* Render Image or Realistic Document Preview */}
              <div className="bg-slate-100 rounded-xl border-2 border-slate-300 p-4 min-h-[260px] flex items-center justify-center text-center">
                {viewingDoc.fileDataUrl ? (
                  <img 
                    src={viewingDoc.fileDataUrl} 
                    alt={viewingDoc.title} 
                    className="max-h-[380px] max-w-full object-contain rounded-lg shadow-xs"
                  />
                ) : (
                  <div className="space-y-3 p-6 bg-white rounded-xl border border-slate-200 shadow-xs max-w-md w-full">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-[#005ea2] flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900">{viewingDoc.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{viewingDoc.fileName}</div>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 text-left font-mono">
                      <div>// Cryptographic Assay Seal: VALID</div>
                      <div>// Storage: AES-256 Vault Encrypted</div>
                      <div>// Access Level: Verified Bullion Participant</div>
                    </div>
                  </div>
                )}
              </div>

              {viewingDoc.notes && (
                <div className="text-xs bg-blue-50 border border-blue-200 text-blue-950 p-3 rounded-xl">
                  <strong>Compliance Notes:</strong> {viewingDoc.notes}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Official Depository Record • Vault ID: {viewingDoc.id}
              </span>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 bg-[#112e51] hover:bg-[#002f5a] text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
