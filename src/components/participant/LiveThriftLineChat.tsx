import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Headphones, 
  User, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  Paperclip,
  MinusCircle
} from 'lucide-react';
import { UserAccount } from '../../types';

interface LiveThriftLineChatProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
}

export const LiveThriftLineChat: React.FC<LiveThriftLineChatProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: `Hello ${user.name}! My name is Jennifer, a certified Bullion Custody & Participant Services Specialist (Badge #VBSP-482). I have verified your authenticated session. How may I assist you with your precious metals portfolio, physical delivery, or account today?`,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = `Thank you for your inquiry. I am checking your account record (${user.accountNumber}) regarding that.`;
      
      const lower = userMsg.text.toLowerCase();
      if (lower.includes('gold') || lower.includes('silver') || lower.includes('metal') || lower.includes('vault')) {
        reply = `Your portfolio is physically allocated in sovereign vaulted custody at ${user.vaultDepositaryLocation || 'Zurich Segregated Depository'}. You have ${user.goldOuncesEquivalent || 46.8} oz Fine Gold and ${user.silverOuncesEquivalent || 420.5} oz Pure Silver allocated to your title with LBMA-certified serial numbers.`;
      } else if (lower.includes('kyc') || lower.includes('ssn') || lower.includes('passport') || lower.includes('id') || lower.includes('license') || lower.includes('driver')) {
        reply = `Your KYC Verification status is currently "${user.kycProfile?.overallStatus || 'Verified (Tier 1 Allocated)'}". You can view, upload, or replace your Social Security Card, Driver's License, and International Passport directly through the "ID Verification & KYC" tab in your dashboard.`;
      } else if (lower.includes('loan') || lower.includes('borrow')) {
        reply = `I see you have an active Bullion Custody Loan with an outstanding balance of $8,500.00. You can borrow up to 50% of your vested vaulted metal balance without liquidating your physical gold or silver holdings.`;
      } else if (lower.includes('delivery') || lower.includes('physical') || lower.includes('ship')) {
        reply = `Physical bar delivery is available for all Tier 1 verified accounts. You can request armored carrier shipment via Brink's / Loomis or schedule a VIP vault inspection visit through the In-Service Withdrawals wizard.`;
      } else if (lower.includes('beneficiary') || lower.includes('trust')) {
        reply = `Your designated beneficiaries on record are active. You can modify or add contingent beneficiaries at any time through the Beneficiaries Designation tab.`;
      } else if (lower.includes('tax') || lower.includes('1099') || lower.includes('irs')) {
        reply = `Your Form 1099-R and Depository Valuation Statements for the current and prior tax years are available for immediate certified PDF download in your Statements & Documents Center.`;
      } else if (lower.includes('catch') || lower.includes('limit') || lower.includes('2026') || lower.includes('contribute')) {
        reply = `For 2026, the standard elective deferral limit is $23,500. The standard age 50+ catch-up is $7,500, and under SECURE 2.0, participants aged 60–63 have a higher catch-up limit of $11,250.`;
      } else {
        reply = `I have documented your request in depository casework ticket #VBSP-2026-${Math.floor(1000 + Math.random() * 9000)}. Is there anything else regarding your vaulted bullion reserve I can help you with today?`;
      }

      setMessages(prev => [...prev, {
        sender: 'agent',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1100);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-blue-900 overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5 duration-200" id="live-thriftline-chat">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-amber-300 font-black text-xs border border-blue-700">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white">Live ThriftLine Representative</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 text-[9px] font-bold rounded">Active</span>
            </div>
            <div className="text-[10px] text-slate-300">Jennifer C. (Badge #FRTIB-482)</div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Security notice */}
      <div className="bg-amber-50 px-3 py-1.5 text-[10px] text-amber-900 border-b border-amber-200 flex items-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span>Authenticated Live Support • Official Federal Recording</span>
      </div>

      {/* Chat Messages */}
      <div className="p-3.5 overflow-y-auto space-y-3 flex-1 bg-slate-50 text-xs">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-3 shadow-2xs ${
              m.sender === 'user'
                ? 'bg-blue-900 text-white rounded-br-xs'
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
            }`}>
              <div className="text-[10px] font-bold opacity-75 mb-0.5">
                {m.sender === 'user' ? user.name : 'Jennifer (ThriftLine)'} • {m.time}
              </div>
              <p className="leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl p-2.5 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1">Representative is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message to representative..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-800"
        />
        <button 
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
