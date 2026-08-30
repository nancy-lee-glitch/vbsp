import React from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileCheck, 
  CheckCircle2, 
  KeyRound, 
  AlertTriangle,
  FileText
} from 'lucide-react';

export const SecurityPrivacyView: React.FC = () => {
  return (
    <div className="space-y-8 pb-12" id="security-privacy-view">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-800 text-emerald-200 rounded-md text-xs font-bold mb-3">
          <Shield className="w-3.5 h-3.5 text-emerald-300" />
          <span>SOVEREIGN SECURITY, VAULT INTEGRITY & PRIVACY COMPLIANCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          How We Protect Your VBSP Bullion Account & Vault Reserves
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          The Vertex Bullion Sovereign Plan implements multi-layered cybersecurity defense, strict Privacy Act protections, 256-bit encryption, physical LBMA vault bar auditing, and full Section 508 accessibility compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Framework */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cybersecurity Architecture</h2>
              <p className="text-xs text-slate-500">NIST SP 800-53 Federal Standards</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">End-to-End 256-Bit AES Encryption:</strong>
                All transactions and account communications are secured using TLS 1.3 in transit and AES-256 at rest.
              </div>
            </li>

            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Mandatory Multi-Factor Authentication (MFA):</strong>
                Every login is verified via Authenticator apps (TOTP), SMS one-time passcodes, or FIDO2 hardware security keys.
              </div>
            </li>

            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">ThriftLine Personal Identification Number (PIN):</strong>
                A unique 6-digit PIN is required to verify identity when speaking with telephone representatives or accessing automated phoneline services.
              </div>
            </li>
          </ul>
        </div>

        {/* Section 508 Accessibility Statement */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Section 508 Accessibility</h2>
              <p className="text-xs text-slate-500">WCAG 2.1 Level AA Compliant</p>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            The Federal Retirement Thrift Investment Board is committed to ensuring that its web properties and participant portals are accessible to all federal employees and retirees, including individuals with disabilities.
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900">Built-in Accessibility Features:</div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Skip-to-main-content keyboard navigation shortcut</li>
              <li>High-contrast visual themes & adjustable typography scaling</li>
              <li>Full screen reader compatibility with ARIA landmarks</li>
              <li>Alternative text for all charts and graphical data</li>
            </ul>
          </div>
        </div>

        {/* Privacy Act Statement */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Privacy Act Statement (5 U.S.C. § 552a)</h2>
              <p className="text-xs text-slate-500">Authority and Routine Uses of Participant Records</p>
            </div>
          </div>

          <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
            <p>
              <strong>Authority:</strong> 5 U.S.C. Chapter 84, Executive Order 9397 as amended by Executive Order 13478 (authorizing the use of the Social Security number to identify federal personnel records).
            </p>
            <p>
              <strong>Purpose:</strong> Information requested is used to establish and maintain your Thrift Savings Plan participant account, process contribution allocations and interfund transfers, disburse loans and withdrawals, and deliver mandatory annual tax statements (IRS Form 1099-R).
            </p>
            <p>
              <strong>Routine Uses:</strong> Information from your records may be disclosed to the Department of the Treasury and Internal Revenue Service for tax administration, to financial institutions for electronic funds transfers, to your employing federal agency payroll office, and to legal representatives in accordance with published system of records notices (FRTIB-1).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
