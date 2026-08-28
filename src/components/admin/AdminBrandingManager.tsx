import React, { useState, useRef } from 'react';
import { 
  SlidersHorizontal, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  RefreshCw, 
  Eye, 
  Globe, 
  ShieldCheck, 
  Trash2, 
  Save, 
  FileText,
  Building,
  Phone,
  Mail,
  Sparkles
} from 'lucide-react';
import { SiteBrandingSettings } from '../../types';
import { DEFAULT_SITE_BRANDING } from '../../data/mockData';

interface AdminBrandingManagerProps {
  branding: SiteBrandingSettings;
  onUpdateBranding: (updated: SiteBrandingSettings) => void;
}

export const AdminBrandingManager: React.FC<AdminBrandingManagerProps> = ({
  branding,
  onUpdateBranding,
}) => {
  const [formData, setFormData] = useState<SiteBrandingSettings>(branding);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof SiteBrandingSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle image upload from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 3MB for base64 storage)
    if (file.size > 3 * 1024 * 1024) {
      alert('Logo file size must be less than 3MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        logoUrl: base64Url
      }));
      setPreviewError(false);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read logo image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Reset to default institutional emblem
  const handleResetToDefault = () => {
    if (confirm('Reset site branding and logo to official Vertex Bullion defaults?')) {
      setFormData(DEFAULT_SITE_BRANDING);
      onUpdateBranding(DEFAULT_SITE_BRANDING);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  // Save branding updates
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBranding(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6" id="admin-branding-manager">
      {/* Header Card */}
      <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-[#112e51] flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#005ea2]" />
              <span>Site Branding, Name & Logo Management</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Customize the platform name, logo emblem, official seal title, domain headers, and contact info displayed across all participant and administrative portals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xs border border-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs text-xs text-emerald-950 font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>Site branding and logo settings have been updated and broadcast across the portal!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: BRANDING FORM (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-5">
            
            {/* 1. Site Name & Domain */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                1. Institutional Platform Identity
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Site Name (Main Title)
                </label>
                <input 
                  type="text" 
                  value={formData.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  placeholder="VERTEX BULLION SAVINGS PLAN"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Displayed prominently in the navigation header, document stamps, and auth windows.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Site Subtitle / Regulatory Tagline
                </label>
                <input 
                  type="text" 
                  value={formData.siteSubtitle}
                  onChange={(e) => handleInputChange('siteSubtitle', e.target.value)}
                  placeholder="Institutional Precious Metals Thrift & Sovereign Bullion Custody Board"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Domain / Badge Tag
                  </label>
                  <input 
                    type="text" 
                    value={formData.siteDomain}
                    onChange={(e) => handleInputChange('siteDomain', e.target.value)}
                    placeholder="VBSP.ORG"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-mono font-bold text-[#005ea2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Top Banner Seal Text
                  </label>
                  <input 
                    type="text" 
                    value={formData.sealText}
                    onChange={(e) => handleInputChange('sealText', e.target.value)}
                    placeholder="Official Sovereign Precious Metals Depository Portal"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Logo Management */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                2. Official Logo / Emblem Upload
              </h3>

              {/* Upload Drop Area */}
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xs space-y-3">
                <div className="flex items-center gap-4">
                  {formData.logoUrl && !previewError ? (
                    <div className="w-16 h-16 rounded-xs bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                      <img 
                        src={formData.logoUrl} 
                        alt="Uploaded Logo" 
                        onError={() => setPreviewError(true)}
                        className="max-h-full max-w-full object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xs bg-[#112e51] text-[#f2a900] flex items-center justify-center font-black text-lg border border-[#002f5a] shrink-0">
                      VB
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <div className="text-xs font-bold text-slate-900">Upload Logo Image from Computer</div>
                    <p className="text-[11px] text-slate-500">Supports transparent PNG, SVG, JPG, WebP (up to 3MB).</p>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3 py-1.5 bg-[#005ea2] hover:bg-[#112e51] text-white text-xs font-bold rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Uploading...' : 'Choose Logo File'}</span>
                      </button>

                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, logoUrl: '' }));
                            setPreviewError(false);
                          }}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xs border border-red-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Image URL fallback */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Or Enter Image URL (CDN / Hosted Asset):
                  </label>
                  <input 
                    type="url" 
                    value={formData.logoUrl}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, logoUrl: e.target.value }));
                      setPreviewError(false);
                    }}
                    placeholder="https://example.com/assets/vbsp-logo.png"
                    className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Support Contacts */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                3. Custodial Support Desk Contacts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Support Phone (ThriftLine)</label>
                  <input 
                    type="text" 
                    value={formData.supportPhone}
                    onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                    placeholder="1-800-VBSP-THRIFT"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Custody Support Email</label>
                  <input 
                    type="email" 
                    value={formData.supportEmail}
                    onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                    placeholder="custody@vbsp.org"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors border border-[#004f87]"
              >
                <Save className="w-4 h-4 text-[#f2a900]" />
                <span>Save & Apply Platform Branding</span>
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: LIVE BRANDING PREVIEW (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-[#112e51] rounded-sm shadow-md overflow-hidden">
            
            <div className="bg-[#112e51] text-white p-3.5 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#f2a900]" />
              <span className="font-bold text-xs">Live Site Header Preview</span>
            </div>

            <div className="p-4 space-y-4 bg-slate-50">
              
              {/* Dark Navigation Header Simulation */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Primary Portal Header Bar:</span>
                <div className="bg-[#112e51] text-white p-4 rounded-xs shadow-sm border border-[#002f5a]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {formData.logoUrl && !previewError ? (
                        <div className="w-10 h-10 rounded-xs overflow-hidden bg-white p-1 border border-slate-300 flex items-center justify-center">
                          <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xs bg-[#002f5a] flex items-center justify-center font-black text-sm text-[#f2a900] border border-[#004f87]">
                          VB
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white tracking-tight">{formData.siteName}</span>
                          <span className="px-1.5 py-0.2 bg-[#002f5a] text-[#f2a900] text-[9px] font-mono font-bold rounded-2xs border border-[#004f87]">
                            {formData.siteDomain}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-tight line-clamp-1">{formData.siteSubtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Light Banner Simulation */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Top Seal & Trust Banner:</span>
                <div className="bg-[#f0f0f0] border-b border-slate-300 px-3 py-2 text-[11px] text-slate-700 flex items-center gap-2 rounded-xs font-sans">
                  <div className="w-4 h-3 bg-red-800 rounded-2xs flex items-center justify-center text-[7px] text-white font-bold">US</div>
                  <span>{formData.sealText}</span>
                </div>
              </div>

              {/* Document Certificate Stamp Preview */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Official Certificate Stamp:</span>
                <div className="p-4 bg-white border border-slate-300 rounded-xs shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="font-bold text-xs text-[#112e51]">{formData.siteName}</div>
                    <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-2xs font-bold border border-emerald-200">
                      OFFICIAL SPECIE
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 italic">
                    "This physical allocation certificate certifies sovereign custody under the {formData.siteName} Board."
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
