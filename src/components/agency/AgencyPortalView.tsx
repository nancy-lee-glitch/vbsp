import React, { useState } from 'react';
import { 
  Building, 
  FileText, 
  GraduationCap, 
  AlertTriangle, 
  HelpCircle, 
  Download, 
  CheckCircle2, 
  Search, 
  Layers, 
  Calendar,
  ExternalLink,
  Shield,
  ArrowRight
} from 'lucide-react';
import { MOCK_AGENCY_BULLETINS } from '../../data/mockData';
import { AgencyBulletin } from '../../types';

export const AgencyPortalView: React.FC = () => {
  const [selectedBulletin, setSelectedBulletin] = useState<AgencyBulletin | null>(MOCK_AGENCY_BULLETINS[0]);
  const [activeTab, setActiveTab] = useState<'bulletins' | 'training' | 'payroll_specs' | 'error_correction'>('bulletins');

  return (
    <div className="space-y-8 pb-12" id="agency-portal-view">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-950 rounded-md text-xs font-bold mb-3">
          <Building className="w-3.5 h-3.5" />
          <span>AGENCY & PAYROLL REPRESENTATIVES PORTAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Agency Human Resources & Payroll Operations
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Official guidance, technical interface specifications, training modules, and administrative bulletins for Agency Benefits Officers (ABOs) and federal payroll service providers (NFC, DFAS, IBC, GSA).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold overflow-x-auto">
        {[
          { id: 'bulletins', label: '1. Official Agency Bulletins', icon: FileText },
          { id: 'payroll_specs', label: '2. Payroll Interface Specs (NFC/DFAS)', icon: Layers },
          { id: 'training', label: '3. Agency Benefits Officer Training', icon: GraduationCap },
          { id: 'error_correction', label: '4. Error Correction & Back-Pay Protocols', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BULLETINS */}
      {activeTab === 'bulletins' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
              Published Technical Bulletins
            </h2>

            <div className="space-y-2">
              {MOCK_AGENCY_BULLETINS.map((b) => {
                const isSelected = selectedBulletin?.id === b.id;
                return (
                  <div 
                    key={b.id}
                    onClick={() => setSelectedBulletin(b)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected ? 'bg-blue-50 border-blue-900 shadow-xs' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded">
                        {b.bulletinNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{b.date}</span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{b.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{b.summary}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            {selectedBulletin ? (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-900 text-white font-mono text-xs font-bold rounded">
                      {selectedBulletin.bulletinNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{selectedBulletin.category}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{selectedBulletin.title}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Effective Date: {selectedBulletin.effectiveDate}</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">Executive Summary:</h4>
                  <p>{selectedBulletin.summary}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button 
                    onClick={() => alert(`Downloading Official PDF Bulletin ${selectedBulletin.bulletinNumber}`)}
                    className="px-4 py-2 bg-slate-900 hover:bg-blue-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full Technical Directive (PDF)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select a bulletin to view full details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAYROLL SPECS */}
      {activeTab === 'payroll_specs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-900">E&L File Transmission & Record Formats</h2>
            <p className="text-xs text-slate-500 mt-1">Automated Clearing House (ACH) and Treasury Record Layouts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 block">Record Type A (Employee Contributions):</span>
              <p className="text-slate-600">Standard fixed-width 120-byte record format including SSN, Plan Code, Traditional Dollar Amount, Roth Dollar Amount, and Catch-Up Flag.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 block">Record Type B (Agency Automatic & Match):</span>
              <p className="text-slate-600">Mandatory 1% Agency Automatic and up to 4% matching contribution computation matching FERS statutory formulas.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRAINING */}
      {activeTab === 'training' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-900">Agency Benefits Officer (ABO) Certification Modules</h2>
            <p className="text-xs text-slate-500 mt-1">Continuous education and federal counseling compliance</p>
          </div>

          <div className="space-y-3">
            {[
              { code: 'ABO-101', title: 'FERS Auto-Enrollment & 5% Default Contribution Onboarding', duration: '45 mins', status: 'Available' },
              { code: 'ABO-204', title: 'SECURE 2.0 Higher Catch-Up Rules for Participants Aged 60–63', duration: '60 mins', status: 'Available' },
              { code: 'ABO-302', title: 'Military Service Credit & USERRA TSP Make-Up Contributions', duration: '90 mins', status: 'Available' },
            ].map((m) => (
              <div key={m.code} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded">{m.code}</span>
                  <h3 className="font-bold text-xs text-slate-900 mt-1">{m.title}</h3>
                  <span className="text-[11px] text-slate-500">{m.duration} • Self-Paced Web Training</span>
                </div>
                <button 
                  onClick={() => alert(`Launching Training Module ${m.code}`)}
                  className="px-3.5 py-1.5 bg-blue-900 text-white text-xs font-bold rounded-lg hover:bg-blue-800 cursor-pointer"
                >
                  Start Course
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ERROR CORRECTION */}
      {activeTab === 'error_correction' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-900">Payroll Error Correction & Breakage Computations</h2>
            <p className="text-xs text-slate-500 mt-1">5 CFR Part 1605 Regulatory Procedures for Missed Contributions and Agency Errors</p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <p>
              When an employing agency fails to properly deduct employee contributions or transmit agency matching funds, the agency must initiate corrective action under <strong>5 CFR § 1605.11</strong>.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
              <div className="font-bold">Breakage (Lost Earnings) Requirement:</div>
              <p>
                Agencies are legally required to calculate and deposit breakage (lost earnings) on agency automatic and matching contributions delayed beyond the statutory deadline.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
