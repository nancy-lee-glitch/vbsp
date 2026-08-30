import React, { useState } from 'react';
import { 
  Inbox, 
  Send, 
  Paperclip, 
  Mail, 
  Shield, 
  CheckCircle2, 
  Clock, 
  User, 
  AlertCircle,
  Search
} from 'lucide-react';
import { UserAccount, ParticipantMessage } from '../../types';

interface ParticipantMailboxProps {
  user: UserAccount;
}

export const ParticipantMailbox: React.FC<ParticipantMailboxProps> = ({ user }) => {
  const [messages, setMessages] = useState<ParticipantMessage[]>([
    {
      id: 'MSG-8821',
      sender: 'VBSP Custody Specialist (Sarah Jenkins)',
      recipient: user.name,
      subject: 'Confirmation of 2026 Beneficiary Designation Update',
      body: 'Dear Marcus Vance,\n\nThis message confirms that your electronic Form VBSP-3 designation of beneficiaries submitted on August 20, 2026 has been processed and accepted into the VBSP official depository record system.\n\nPrimary Beneficiaries:\n- Sarah Vance (Spouse) - 100%\n\nNo further paperwork or physical signatures are required at this time.\n\nSincerely,\nVBSP Bullion Operations',
      timestamp: '2026-08-20 14:22 EST',
      isRead: true,
      hasAttachments: false
    },
    {
      id: 'MSG-8819',
      sender: 'Automated Account Notification',
      recipient: user.name,
      subject: '2026 Q2 Participant Statement Now Available',
      body: 'Your official Quarterly Participant Statement for the period ending June 30, 2026 is now available for download in your Documents & Statements Center. Your closing portfolio balance was $342,850.12 with an annualized YTD return of +14.80%.',
      timestamp: '2026-07-05 09:00 EST',
      isRead: true,
      hasAttachments: true
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<ParticipantMessage>(messages[0]);
  const [isComposing, setIsComposing] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('Account Administration');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newBody.trim()) return;

    const newMsg: ParticipantMessage = {
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      sender: user.name,
      recipient: 'ThriftLine Representative',
      subject: `[${newCategory}] ${newSubject}`,
      body: newBody,
      timestamp: new Date().toLocaleString(),
      isRead: true,
      hasAttachments: false
    };

    setMessages([newMsg, ...messages]);
    setSelectedMessage(newMsg);
    setIsComposing(false);
    setNewSubject('');
    setNewBody('');
  };

  return (
    <div className="space-y-6 pb-12" id="participant-mailbox">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-blue-800" />
            <h2 className="text-xl font-black text-slate-900">Secure Participant Mailbox</h2>
          </div>
          <p className="text-xs text-slate-600">
            End-to-end encrypted messaging with VBSP sovereign depository caseworkers and support staff.
          </p>
        </div>

        <button 
          onClick={() => setIsComposing(true)}
          className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
        >
          <Send className="w-4 h-4" />
          <span>Compose New Message</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List Sidebar */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            Inbox Messages ({messages.length})
          </div>

          <div className="space-y-2">
            {messages.map((m) => {
              const isSelected = selectedMessage.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => { setSelectedMessage(m); setIsComposing(false); }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-800 shadow-xs' 
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[200px]">{m.sender}</span>
                    <span className="text-[10px] text-slate-400">{m.timestamp.split(' ')[0]}</span>
                  </div>
                  <div className="text-xs font-semibold text-blue-950 truncate">{m.subject}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{m.body}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Viewer / Composer Body */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          {isComposing ? (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">New Secure Inquiry</h3>
                <span className="text-[11px] text-emerald-700 font-semibold">256-Bit Encrypted Channel</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="Account Administration">Account Administration & Profile</option>
                  <option value="Loans & Withdrawals">Loans & In-Service Withdrawals</option>
                  <option value="Fund Allocations">Fund Allocations & Interfund Transfers</option>
                  <option value="Tax Forms 1099-R">Tax Reporting & 1099-R</option>
                  <option value="Retirement Counseling">Retirement Calculation Guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g., Question regarding 2026 catch-up contribution limits"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                <textarea 
                  rows={6}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Describe your question or request in detail..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-normal"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Secure Message</span>
                </button>
              </div>
            </form>
          ) : selectedMessage ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] text-slate-500">{selectedMessage.timestamp}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                    Msg ID: {selectedMessage.id}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{selectedMessage.subject}</h3>
                <div className="text-xs text-slate-600 mt-1">
                  From: <strong className="text-slate-800">{selectedMessage.sender}</strong>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {selectedMessage.body}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={() => {
                    setIsComposing(true);
                    setNewSubject(`Re: ${selectedMessage.subject}`);
                  }}
                  className="px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl hover:bg-blue-800 cursor-pointer"
                >
                  Reply to Inquiry
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a message from your inbox to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
