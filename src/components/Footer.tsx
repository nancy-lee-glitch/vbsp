import React from 'react';
import { Shield, Phone, Mail, FileText, Lock, ExternalLink, Building2 } from 'lucide-react';
import { PortalView, SiteBrandingSettings } from '../types';

interface FooterProps {
  onNavigate: (view: PortalView) => void;
  branding?: SiteBrandingSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, branding }) => {
  const siteName = branding?.siteName || 'Vertex Bullion Savings Plan';
  const supportEmail = branding?.supportEmail || 'thriftline@vbsp.org';
  const supportPhone = branding?.supportPhone || '1-800-827-7877';

  return (
    <footer className="w-full bg-[#112e51] text-slate-200 border-t-4 border-[#005ea2] text-xs mt-16" id="tsp-main-footer">
      {/* Return to Top Anchor Bar */}
      <div className="bg-[#002f5a] py-2.5 px-4 text-center border-b border-[#112e51]">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-slate-300 hover:text-white underline font-semibold text-xs cursor-pointer inline-flex items-center gap-1"
          id="footer-return-to-top"
        >
          Return to top
        </button>
      </div>

      {/* Main Federal Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Col 1: Vertex Bullion Savings Plan Mission */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {branding?.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt={siteName} 
                className="w-7 h-7 object-contain rounded-xs bg-white/10 p-0.5" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-sm bg-[#005ea2] flex items-center justify-center text-[#f2a900] font-bold border border-[#004f87]">
                <Shield className="w-4 h-4" />
              </div>
            )}
            <span className="text-white font-bold text-sm">{siteName}</span>
          </div>
          <p className="text-slate-300 leading-relaxed mb-4 text-xs">
            {branding?.siteDescription || 'Institutional precious metals savings and vaulted custody plan modeled after the federal thrift architecture, providing allocated Gold, Silver, Platinum, and Treasury reserves.'}
          </p>
          <div className="text-slate-300 space-y-1 text-xs border-t border-[#002f5a] pt-3">
            <p className="font-semibold text-white">Custody & Vault Administration:</p>
            <p>{branding?.organizationName || 'Vertex Sovereign Bullion Custody Board (VSBCB)'}</p>
            <p>100 Wall Street, Bullion Vault District, New York, NY 10005</p>
          </div>
        </div>

        {/* Col 2: Official ThriftLine Contact Details */}
        <div>
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-1.5 border-b border-[#002f5a] pb-1">
            <Phone className="w-4 h-4 text-[#f2a900]" />
            <span>ThriftLine & Vault Desk</span>
          </h3>
          <ul className="space-y-2.5 text-slate-300 text-xs">
            <li>
              <span className="block text-slate-400 font-medium">Toll-Free (U.S. & Canada):</span>
              <a href={`tel:${supportPhone.replace(/[^0-9+]/g, '')}`} className="text-[#f2a900] hover:underline font-bold text-sm">
                {supportPhone}
              </a>
            </li>
            <li>
              <span className="block text-slate-400 font-medium">Official Dispatch Email:</span>
              <a href={`mailto:${supportEmail}`} className="text-[#00a3e0] hover:underline font-mono text-xs">
                {supportEmail}
              </a>
            </li>
            <li>
              <span className="block text-slate-400 font-medium">Zurich / London Vault Desk:</span>
              <span className="text-white font-medium">+41 44 215 5000</span>
            </li>
            <li>
              <span className="block text-slate-400 font-medium">Operating Hours:</span>
              <span>24/7 Live Vault Trading & Allocation Support</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Public Services & Portal Directory */}
        <div>
          <h3 className="text-white font-bold text-sm mb-3 border-b border-[#002f5a] pb-1">
            Plan Resources & Tools
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <button 
                onClick={() => onNavigate('public_funds')}
                className="text-slate-300 hover:text-white transition-colors text-left cursor-pointer underline"
                id="footer-link-funds"
              >
                Core Metal Funds & Live Spot Valuations
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('public_calculators')}
                className="text-slate-300 hover:text-white transition-colors text-left cursor-pointer underline"
                id="footer-link-calculators"
              >
                Bullion Accumulation & Thrift Modeler
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('public_forms')}
                className="text-slate-300 hover:text-white transition-colors text-left cursor-pointer underline"
                id="footer-link-forms"
              >
                Custody Forms & LBMA Assay Certificates
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('public_education')}
                className="text-slate-300 hover:text-white transition-colors text-left cursor-pointer underline"
                id="footer-link-education"
              >
                VBSP Account Types & Bullion Matching Rules
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('agency_portal')}
                className="text-slate-300 hover:text-white transition-colors text-left cursor-pointer underline"
                id="footer-link-agency"
              >
                Corporate & Payroll Providers Interface
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('admin_portal')}
                className="text-slate-300 hover:text-white transition-colors text-left cursor-pointer underline"
                id="footer-link-admin"
              >
                VBSP Executive Admin & Compliance Console
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Compliance & Custodial Protections */}
        <div>
          <h3 className="text-white font-bold text-sm mb-3 border-b border-[#002f5a] pb-1">
            Institutional Custody & Auditing
          </h3>
          <ul className="space-y-2 text-slate-300 text-xs">
            <li>
              <button 
                onClick={() => onNavigate('public_security')}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left underline"
                id="footer-link-security-protection"
              >
                Physical Vault Segregation & Insurance
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('public_security')}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left underline"
                id="footer-link-privacy-statement"
              >
                NIST SP 800-53 Compliance & Privacy Notice
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('public_security')}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left underline"
                id="footer-link-section-508"
              >
                Section 508 Accessibility Statement
              </button>
            </li>
            <li>
              <span className="text-slate-300 inline-flex items-center gap-1">
                <span>LBMA Good Delivery Standard</span>
              </span>
            </li>
            <li>
              <span className="text-slate-300 inline-flex items-center gap-1">
                <span>100% Segregated Specie Allocated</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official Institutional Disclaimer Bar */}
      <div className="bg-[#002f5a] border-t border-[#112e51] py-4 px-4 sm:px-8 text-slate-300 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Lock className="w-3.5 h-3.5 text-[#00a3e0]" />
            <span>Vertex Bullion Savings Plan (VBSP) Institutional Custody Network. All vaulted holdings are insured by Lloyd's of London syndicates.</span>
          </div>
          <div className="flex items-center gap-3 justify-center text-slate-400">
            <span>Standard / Sovereign IRA / Corporate Reserve</span>
            <span>•</span>
            <span>2026 Bullion Limits Verified</span>
            <span>•</span>
            <span className="text-emerald-300 font-semibold">Vault Status: 100% Allocated & Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
