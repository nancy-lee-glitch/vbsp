import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  UserCheck, 
  FileText, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  X,
  Layers,
  Check,
  Calendar,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { UserAccount, AdminEmailDispatch, SiteBrandingSettings, VBSPAccountType } from '../../types';

interface AdminEmailCenterProps {
  users: UserAccount[];
  branding: SiteBrandingSettings;
  dispatches: AdminEmailDispatch[];
  onSendEmail: (dispatch: AdminEmailDispatch) => void;
}

const EMAIL_TEMPLATES = [
  {
    id: 'vault-audit',
    name: 'Annual Vault Specie Audit Certificate',
    subject: 'Official Verification: Allocated Precious Metals Specie Audit (Bureau Veritas)',
    priority: 'Important' as const,
    body: `Dear {{name}},

This official custodial notice certifies that your physical bullion allocation in {{plan_type}} (Account: {{account_number}}) has undergone scheduled physical assay inspection by Bureau Veritas at {{vault_location}}.

AUDIT SUMMARY & SPECIE RECONCILIATION:
- Account Holder: {{name}}
- Portfolio Valuation: \${{total_balance}} USD
- Title Type: 100% Segregated Allocated Title (Zero Hypothecation)
- Assay Purity: .9999 Fine LBMA Good Delivery Standard
- Depository Vault: {{vault_location}}

Your bar serial registry and vault weight certificates remain safely recorded on the sovereign ledger. You may log into your vault dashboard at any time to verify bar serial numbers or request physical delivery.

Custodial Administration Desk,
Vertex Bullion Savings Plan`
  },
  {
    id: 'quarterly-statement',
    name: 'Quarterly Bullion Reserve Statement',
    subject: 'Your Quarterly VBSP Sovereign Bullion Reserve Statement is Ready',
    priority: 'Normal' as const,
    body: `Dear {{name}},

Your latest quarterly statement for {{plan_type}} (Account: {{account_number}}) is now available for download.

PORTFOLIO HIGHLIGHTS:
- Current Vault Value: \${{total_balance}} USD
- Primary Metals: G-Fund (Gold), S-Fund (Silver), P-Fund (Platinum)
- Registered Depository: {{vault_location}}

To review your complete transaction history, dividend reinvestments, and spot price performance, please authenticate through the secure VBSP portal.

Sincerely,
Vertex Bullion Custodial Services`
  },
  {
    id: 'statutory-limits',
    name: '2026 Statutory Contribution Limit Advisory',
    subject: '2026 Elective Deferral Limits & Matching Notice',
    priority: 'Normal' as const,
    body: `Dear {{name}},

The 2026 statutory elective deferral limit has been set at $23,500 with a standard catch-up limit of $7,500 for participants age 50 and older. Participants ages 60-63 are eligible for the SECURE 2.0 higher catch-up tier of $11,250.

Please confirm your payroll deductions or corporate bullion allocations with your payroll officer to ensure full matching capture.

Vertex Bullion Compliance & Legal Office`
  },
  {
    id: 'security-fips',
    name: 'Security & FIPS Hardware Key Advisory',
    subject: 'CRITICAL SECURITY NOTICE: Verify 2-Factor Authentication and ThriftLine PIN',
    priority: 'Urgent Vault Notice' as const,
    body: `Dear {{name}},

As part of our continuous NIST SP 800-53 security protocol, all participants with active holdings in {{plan_type}} must review their 6-Digit ThriftLine PIN and registered recovery credentials.

If you did not initiate any recent profile changes on account {{account_number}}, contact our 24/7 Security Vault Desk immediately at 1-800-VBSP-THRIFT.

Vertex Bullion Cyber & Physical Vault Defense Team`
  },
  {
    id: 'custom-blank',
    name: 'Custom Administrative Notice',
    subject: 'Official Notice from Vertex Bullion Savings Plan Administration',
    priority: 'Normal' as const,
    body: `Dear {{name}},

We are writing to notify you regarding important updates to your {{plan_type}} account ({{account_number}}).

[Enter your custom message here]

Thank you for trusting the Vertex Bullion Savings Plan for your sovereign precious metals thrift.

Vertex Bullion Custody Board`
  }
];

export const AdminEmailCenter: React.FC<AdminEmailCenterProps> = ({
  users,
  branding,
  dispatches,
  onSendEmail,
}) => {
  // Recipient Selection State
  const [recipientMode, setRecipientMode] = useState<'all' | 'classification' | 'single' | 'selected'>('all');
  const [selectedPlanType, setSelectedPlanType] = useState<VBSPAccountType>('VBSP Standard Account (Taxable Reserve)');
  const [singleUserId, setSingleUserId] = useState<string>(users[0]?.id || '');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([users[0]?.id || '']);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Email Content State
  const [selectedTemplate, setSelectedTemplate] = useState<string>('vault-audit');
  const [senderName, setSenderName] = useState('Vertex Bullion Custody Service');
  const [senderEmail, setSenderEmail] = useState('custody-notifications@vbsp.org');
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent Vault Notice'>('Important');
  const [emailBody, setEmailBody] = useState(EMAIL_TEMPLATES[0].body);

  // UI state
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState('');
  const [previewUser, setPreviewUser] = useState<UserAccount>(users[0]);
  const [viewingDispatch, setViewingDispatch] = useState<AdminEmailDispatch | null>(null);

  // Calculate matching recipients based on mode
  const getTargetRecipients = (): UserAccount[] => {
    switch (recipientMode) {
      case 'all':
        return users;
      case 'classification':
        return users.filter(u => u.planType === selectedPlanType);
      case 'single': {
        const u = users.find(user => user.id === singleUserId);
        return u ? [u] : (users[0] ? [users[0]] : []);
      }
      case 'selected':
        return users.filter(u => selectedUserIds.includes(u.id));
      default:
        return users;
    }
  };

  const targetRecipients = getTargetRecipients();

  // Load Template
  const handleSelectTemplate = (templateId: string) => {
    const t = EMAIL_TEMPLATES.find(tpl => tpl.id === templateId);
    if (!t) return;
    setSelectedTemplate(templateId);
    setSubject(t.subject);
    setPriority(t.priority);
    setEmailBody(t.body);
  };

  // Toggle user selection in multi-select mode
  const handleToggleUserSelect = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  // Insert macro placeholder chip into body
  const handleInsertTag = (tag: string) => {
    setEmailBody(prev => prev + ` {{${tag}}}`);
  };

  // Generate personalized email content for preview or delivery
  const renderPersonalizedContent = (text: string, user: UserAccount): string => {
    return text
      .replace(/{{name}}/g, user.name)
      .replace(/{{account_number}}/g, user.accountNumber)
      .replace(/{{email}}/g, user.email)
      .replace(/{{plan_type}}/g, user.planType)
      .replace(/{{total_balance}}/g, user.totalBalance.toLocaleString())
      .replace(/{{vault_location}}/g, user.vaultDepositaryLocation || 'Zurich FreePort High-Security Vault (Malca-Amit)')
      .replace(/{{agency}}/g, user.employingAgency || 'Federal Reserve Custodial Member');
  };

  // Send Email Handler
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRecipients.length === 0) {
      alert('Please select at least one recipient.');
      return;
    }

    setIsSending(true);
    setSendSuccessMessage('');

    setTimeout(() => {
      let desc = '';
      if (recipientMode === 'all') desc = `All Registered Participants (${targetRecipients.length} Users)`;
      else if (recipientMode === 'classification') desc = `${selectedPlanType} (${targetRecipients.length} Users)`;
      else if (recipientMode === 'single') desc = `${targetRecipients[0]?.name} (${targetRecipients[0]?.email})`;
      else desc = `Selected Participants (${targetRecipients.length} Users)`;

      const newDispatch: AdminEmailDispatch = {
        id: `dispatch-${Date.now().toString().slice(-6)}`,
        subject: subject,
        body: emailBody,
        senderName: senderName,
        senderEmail: senderEmail,
        recipientType: recipientMode,
        recipientTargetDescription: desc,
        recipientCount: targetRecipients.length,
        recipientNames: targetRecipients.map(u => u.name),
        recipientEmails: targetRecipients.map(u => u.email),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        priority: priority,
        templateName: EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Custom Dispatch',
        status: 'Delivered'
      };

      onSendEmail(newDispatch);
      setIsSending(false);
      setSendSuccessMessage(`Successfully dispatched email to ${targetRecipients.length} recipient${targetRecipients.length > 1 ? 's' : ''}!`);
      
      // Auto-clear message after 5s
      setTimeout(() => setSendSuccessMessage(''), 5000);
    }, 800);
  };

  return (
    <div className="space-y-6" id="admin-email-center">
      {/* Header Info */}
      <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-[#112e51] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#005ea2]" />
              <span>Participant Communications & Email Dispatch Center</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Broadcast official bullion certificates, statutory limit bulletins, and vault statements directly to all participants or selected sovereign accounts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xs border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SMTP / NIST SP 800-53 Compliant</span>
            </span>
          </div>
        </div>

        {sendSuccessMessage && (
          <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs text-xs text-emerald-950 font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{sendSuccessMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: COMPOSER (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSendEmail} className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-5">
            
            {/* 1. Recipient Audience Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">
                1. Select Recipient Audience:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientMode('all')}
                  className={`p-2.5 rounded-xs border text-xs font-bold text-left cursor-pointer transition-colors ${
                    recipientMode === 'all' 
                      ? 'bg-[#112e51] text-white border-[#112e51]' 
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 mb-1" />
                  <div>All Users ({users.length})</div>
                  <div className="text-[10px] font-normal opacity-80">Full Broadcast</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientMode('classification')}
                  className={`p-2.5 rounded-xs border text-xs font-bold text-left cursor-pointer transition-colors ${
                    recipientMode === 'classification' 
                      ? 'bg-[#112e51] text-white border-[#112e51]' 
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-4 h-4 mb-1" />
                  <div>By Plan Type</div>
                  <div className="text-[10px] font-normal opacity-80">Target Plan Tier</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientMode('single')}
                  className={`p-2.5 rounded-xs border text-xs font-bold text-left cursor-pointer transition-colors ${
                    recipientMode === 'single' 
                      ? 'bg-[#112e51] text-white border-[#112e51]' 
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mb-1" />
                  <div>Single User</div>
                  <div className="text-[10px] font-normal opacity-80">Direct Message</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientMode('selected')}
                  className={`p-2.5 rounded-xs border text-xs font-bold text-left cursor-pointer transition-colors ${
                    recipientMode === 'selected' 
                      ? 'bg-[#112e51] text-white border-[#112e51]' 
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4 mb-1" />
                  <div>Multi-Select ({selectedUserIds.length})</div>
                  <div className="text-[10px] font-normal opacity-80">Custom Subset</div>
                </button>
              </div>
            </div>

            {/* Recipient Filter Sub-Controls */}
            {recipientMode === 'classification' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xs space-y-1.5 animate-in fade-in">
                <label className="block text-xs font-bold text-slate-800">
                  Select Plan Classification Tier:
                </label>
                <select 
                  value={selectedPlanType}
                  onChange={(e: any) => setSelectedPlanType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xs p-2 text-xs font-bold text-slate-900"
                >
                  <option value="VBSP Standard Account (Taxable Reserve)">VBSP Standard Account (Taxable Reserve) — {users.filter(u => u.planType === 'VBSP Standard Account (Taxable Reserve)').length} users</option>
                  <option value="VBSP Sovereign Custody (Self-Directed / IRA)">VBSP Sovereign Custody (Self-Directed / IRA) — {users.filter(u => u.planType === 'VBSP Sovereign Custody (Self-Directed / IRA)').length} users</option>
                  <option value="VBSP Institutional / Corporate Reserve">VBSP Institutional / Corporate Reserve — {users.filter(u => u.planType === 'VBSP Institutional / Corporate Reserve)').length} users</option>
                </select>
              </div>
            )}

            {recipientMode === 'single' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xs space-y-1.5 animate-in fade-in">
                <label className="block text-xs font-bold text-slate-800">
                  Select Specific Target Participant:
                </label>
                <select 
                  value={singleUserId}
                  onChange={(e) => {
                    setSingleUserId(e.target.value);
                    const found = users.find(u => u.id === e.target.value);
                    if (found) setPreviewUser(found);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xs p-2 text-xs font-bold text-slate-900"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.accountNumber}) — {u.email} — ${u.totalBalance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {recipientMode === 'selected' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Select Participants to Include ({selectedUserIds.length} Selected):
                  </span>
                  <div className="space-x-2">
                    <button 
                      type="button" 
                      onClick={() => setSelectedUserIds(users.map(u => u.id))}
                      className="text-[11px] text-[#005ea2] hover:underline font-bold"
                    >
                      Select All
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedUserIds([])}
                      className="text-[11px] text-slate-500 hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-slate-300 bg-white rounded-xs p-2">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xs cursor-pointer text-xs">
                      <input 
                        type="checkbox"
                        checked={selectedUserIds.includes(u.id)}
                        onChange={() => handleToggleUserSelect(u.id)}
                        className="rounded-xs text-[#005ea2]"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-bold text-slate-800">{u.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{u.accountNumber} ({u.email})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Template Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                2. Select Message Template / Preset:
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2 text-xs font-semibold text-slate-900"
              >
                {EMAIL_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Sender & Priority Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Sender Name</label>
                <input 
                  type="text" 
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Sender Email</label>
                <input 
                  type="email" 
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Priority</label>
                <select 
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs font-bold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent Vault Notice">Urgent Vault Notice</option>
                </select>
              </div>
            </div>

            {/* 4. Subject Line */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Email Subject Line:
              </label>
              <input 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-bold text-slate-900"
                required
              />
            </div>

            {/* 5. Dynamic Tags Toolbar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#005ea2]" />
                  Insert Personalized Macro Variables:
                </span>
                <span className="text-slate-500">Click to insert tag into text</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: 'name', label: '{{name}}' },
                  { tag: 'account_number', label: '{{account_number}}' },
                  { tag: 'email', label: '{{email}}' },
                  { tag: 'plan_type', label: '{{plan_type}}' },
                  { tag: 'total_balance', label: '{{total_balance}}' },
                  { tag: 'vault_location', label: '{{vault_location}}' },
                  { tag: 'agency', label: '{{agency}}' },
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#005ea2] border border-blue-200 rounded-xs font-mono text-[11px] font-bold cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Body Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Message Body:
              </label>
              <textarea 
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={10}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs p-3 text-xs font-sans font-medium text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                required
              />
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-600">
                Target: <strong className="text-slate-900">{targetRecipients.length}</strong> recipients selected
              </div>

              <button
                type="submit"
                disabled={isSending || targetRecipients.length === 0}
                className="px-6 py-2.5 bg-[#005ea2] hover:bg-[#112e51] disabled:bg-slate-400 text-white font-bold text-xs rounded-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Broadcasting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#f2a900]" />
                    <span>Send Official Email ({targetRecipients.length})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW & OUTBOX (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Email Preview Card */}
          <div className="bg-white border-2 border-[#112e51] rounded-sm shadow-md overflow-hidden">
            <div className="bg-[#112e51] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#f2a900]" />
                <span className="font-bold text-xs">Live Recipient Email Mockup</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-300">
                <span>Preview As:</span>
                <select
                  value={previewUser.id}
                  onChange={(e) => {
                    const u = users.find(user => user.id === e.target.value);
                    if (u) setPreviewUser(u);
                  }}
                  className="bg-[#002f5a] text-white rounded-xs px-1.5 py-0.5 text-[11px] font-bold border border-[#004f87]"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name.split(' ')[0]} ({u.planType.split(' ')[1] || 'VBSP'})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Canvas Header */}
            <div className="p-4 bg-slate-100 border-b border-slate-300 text-xs space-y-1 font-mono text-slate-700">
              <div><strong className="text-slate-900 font-sans">From:</strong> {senderName} &lt;{senderEmail}&gt;</div>
              <div><strong className="text-slate-900 font-sans">To:</strong> {previewUser.name} &lt;{previewUser.email}&gt;</div>
              <div><strong className="text-slate-900 font-sans">Subject:</strong> {subject}</div>
              <div className="flex items-center gap-2 pt-1 font-sans">
                <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${
                  priority === 'Urgent Vault Notice' ? 'bg-red-100 text-red-800' :
                  priority === 'Important' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                }`}>
                  Priority: {priority}
                </span>
                <span className="text-[10px] text-slate-500">Security: TLS 1.3 / Authenticated</span>
              </div>
            </div>

            {/* Email Canvas Body */}
            <div className="p-6 bg-white space-y-4 text-xs">
              {/* Official Brand Header inside Email */}
              <div className="pb-3 border-b-2 border-[#112e51] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-7 h-7 bg-[#112e51] text-[#f2a900] flex items-center justify-center font-bold text-xs rounded-2xs">
                      VB
                    </div>
                  )}
                  <div>
                    <div className="font-black text-sm text-[#112e51] tracking-tight">{branding.siteName}</div>
                    <div className="text-[10px] text-slate-500">{branding.sealText}</div>
                  </div>
                </div>
              </div>

              {/* Rendered Personalized Body */}
              <div className="whitespace-pre-wrap text-slate-800 leading-relaxed font-sans text-xs bg-slate-50/50 p-4 border border-slate-200 rounded-xs">
                {renderPersonalizedContent(emailBody, previewUser)}
              </div>

              {/* Secure Call-to-Action */}
              <div className="pt-2 text-center">
                <div className="inline-block px-5 py-2 bg-[#112e51] text-white font-bold text-xs rounded-xs shadow-xs">
                  Access Sovereign Vault Portal
                </div>
              </div>

              {/* Official Disclaimer Footer */}
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 space-y-1 leading-normal text-center">
                <p>Vertex Bullion Savings Plan (VBSP) • Physical Bullion Specie Custody Board</p>
                <p>100 Wall Street, New York, NY 10005 • Inquiries: {branding.supportEmail} • {branding.supportPhone}</p>
                <p>This automated message was generated by the executive custody ledger. FIPS 140-2 compliance verified.</p>
              </div>
            </div>
          </div>

          {/* Sent Messages Outbox / History */}
          <div className="bg-white border border-slate-300 rounded-sm p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-black text-[#112e51] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#005ea2]" />
                <span>Sent Messages History & Outbox ({dispatches.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {dispatches.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setViewingDispatch(item)}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xs text-xs space-y-1 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{item.subject}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-2xs text-[10px]">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{item.recipientTargetDescription}</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* VIEW SENT MESSAGE MODAL */}
      {viewingDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-sm shadow-2xl border border-slate-300 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="bg-[#112e51] text-white p-4 flex items-center justify-between border-b border-[#002f5a]">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#f2a900]" />
                <h3 className="font-bold text-sm">Dispatched Email Record: {viewingDispatch.id}</h3>
              </div>
              <button 
                onClick={() => setViewingDispatch(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xs">
                <div><strong>Subject:</strong> {viewingDispatch.subject}</div>
                <div><strong>Dispatched:</strong> {viewingDispatch.timestamp}</div>
                <div><strong>Sender:</strong> {viewingDispatch.senderName} ({viewingDispatch.senderEmail})</div>
                <div><strong>Audience:</strong> {viewingDispatch.recipientTargetDescription}</div>
              </div>

              <div>
                <strong className="block text-slate-800 mb-1">Delivered Message Content:</strong>
                <pre className="p-4 bg-slate-100 border border-slate-300 rounded-xs font-sans whitespace-pre-wrap text-slate-900 leading-relaxed text-xs">
                  {viewingDispatch.body}
                </pre>
              </div>

              <div>
                <strong className="block text-slate-800 mb-1">Recipients List ({viewingDispatch.recipientCount}):</strong>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xs">
                  {viewingDispatch.recipientEmails.map((email, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white border border-slate-300 rounded-2xs text-[11px] text-slate-700">
                      {viewingDispatch.recipientNames[idx] ? `${viewingDispatch.recipientNames[idx]} <${email}>` : email}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button 
                  onClick={() => setViewingDispatch(null)}
                  className="px-4 py-2 bg-[#112e51] hover:bg-[#002f5a] text-white font-bold rounded-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
