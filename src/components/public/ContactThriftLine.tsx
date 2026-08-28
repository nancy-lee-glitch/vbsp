import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2,
  Calendar,
  Building2,
  Lock
} from 'lucide-react';

interface ContactThriftLineProps {
  onNavigate?: (view: any) => void;
}

export const ContactThriftLine: React.FC<ContactThriftLineProps> = () => {
  return (
    <div className="space-y-8 pb-12" id="contact-thriftline">
      {/* Header */}
      <div className="bg-[#112e51] text-white rounded-sm p-6 sm:p-8 shadow-md border border-[#002f5a]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#002f5a] text-[#f2a900] rounded-xs text-xs font-bold mb-3 border border-[#004f87]">
          <Phone className="w-3.5 h-3.5" />
          <span>OFFICIAL VBSP THRIFTLINE & CUSTODIAL SUPPORT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Contact Vertex Bullion Savings Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
          Connect with dedicated sovereign bullion custody specialists, bullion allocation officers, and participant retirement support via phone, secure vault correspondence, or global depository desks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Toll-Free Phone */}
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
          <div className="w-10 h-10 rounded-xs bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#112e51]">Telephone / VBSP ThriftLine</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live Vault Custodians & Automated Tele-PIN</p>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <span className="font-bold text-slate-900 block">Toll-Free (US & Canada):</span>
              <a href="tel:18008277877" className="text-[#005ea2] hover:underline font-black text-base">
                1-800-VBSP-THRIFT (827-7877)
              </a>
            </div>

            <div>
              <span className="font-bold text-slate-900 block">International Direct Dial (NYC Vault):</span>
              <span className="text-slate-800 font-semibold">+1-212-555-0199</span>
            </div>

            <div>
              <span className="font-bold text-slate-900 block">Zurich Depository Direct Desk:</span>
              <span className="text-slate-800 font-semibold">+41 44 215 5000</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-start gap-2">
              <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Operating Hours:</strong>
                <span>Monday – Friday, 7:00 a.m. – 9:00 p.m. Eastern Time (Live Trading & Allocations 24/7)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Secure Custodial Support */}
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xs bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#112e51]">Custodial Communications</h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-xs">
                  Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Direct Specie Allocation Verification</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              For bar serial queries, vault in-kind delivery requests, rollovers from 401(k)/IRA to sovereign gold reserves, and agency payroll matching confirmations.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs text-xs space-y-1">
              <div className="font-bold text-slate-800">Support Inquiries:</div>
              <a href="mailto:custody@vbsp.org" className="text-[#005ea2] hover:underline font-semibold block">
                custody@vbsp.org
              </a>
              <a href="mailto:compliance@vbsp.org" className="text-[#005ea2] hover:underline font-semibold block">
                compliance@vbsp.org
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>All inquiries verified with 2-Factor ID before disclosure.</span>
          </div>
        </div>

        {/* Card 3: Mailing & Physical Address */}
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
          <div className="w-10 h-10 rounded-xs bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#112e51]">Depository & Board Locations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Physical Bar Submissions & Board Administration</p>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <span className="font-bold text-slate-900 block">General Participant Correspondence:</span>
              <p className="text-slate-600">
                Vertex Bullion Savings Plan Board<br />
                100 Wall Street, 28th Floor<br />
                New York, NY 10005
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block">Zurich Depository Vault:</span>
              <p className="text-slate-600">
                Zurich FreePort High-Security Vaults<br />
                Malca-Amit Specie Wing A-04<br />
                Zurich, Switzerland
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block">London LBMA Vault:</span>
              <p className="text-slate-600">
                Loomis International Bullion Terminal<br />
                London EC2V 6ET, United Kingdom
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
