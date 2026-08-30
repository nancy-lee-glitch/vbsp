import React, { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle2, Award, Sparkles } from 'lucide-react';

interface SovereignPreloaderProps {
  onComplete: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
  logoUrl?: string;
}

export const SovereignPreloader: React.FC<SovereignPreloaderProps> = ({
  onComplete,
  brandTitle = 'VERTEX BULLION SOVEREIGN PLAN',
  brandSubtitle = 'Federal Depository Vault & Allocated Physical Bullion Custody',
  logoUrl
}) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const securityStatuses = [
    { text: 'Initializing FIPS-140-3 Hardware Security Enclave...', code: 'SEC-INIT-01' },
    { text: 'Connecting to Zurich & Delaware Segregated Vault Feeds...', code: 'VAULT-LINK-04' },
    { text: 'Calibrating LBMA 999.9 Fine Gold & Silver Spot Assays...', code: 'ASSAY-CAL-09' },
    { text: 'Synchronizing Sovereign Participant Reserve Ledgers...', code: 'LEDGER-SYNC-12' },
    { text: 'Allocated Vault Channel Verified & Secured • Entering...', code: 'SYSTEM-READY' }
  ];

  useEffect(() => {
    // Smooth progress increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerate smoothly
        const step = prev < 30 ? 3 : prev < 70 ? 4 : prev < 90 ? 2 : 5;
        const next = Math.min(prev + step, 100);

        // Update status according to progress
        if (next < 25) setStatusIndex(0);
        else if (next < 50) setStatusIndex(1);
        else if (next < 75) setStatusIndex(2);
        else if (next < 98) setStatusIndex(3);
        else setStatusIndex(4);

        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const exitTimer = setTimeout(() => {
          onComplete();
        }, 600);
        return () => clearTimeout(exitTimer);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      id="sovereign-preloader"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#071322] text-white select-none transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 filter blur-xs' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 40%, rgba(242, 169, 0, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(0, 94, 162, 0.18) 0%, transparent 70%),
          linear-gradient(180deg, #060e18 0%, #0a1829 50%, #040911 100%)
        `
      }}
    >
      {/* Background Vault Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#f2a900 1px, transparent 1px), linear-gradient(90deg, #f2a900 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Outer Glow Orb */}
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        
        {/* Animated Vault Dial / Sovereign Crest */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          
          {/* Outer Rotating Segmented Ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 animate-spin"
            style={{ animationDuration: '14s' }}
          />

          {/* Counter-rotating Inner Precision Ring */}
          <div 
            className="absolute inset-2 rounded-full border border-amber-300/30 border-t-amber-400 border-r-transparent animate-spin"
            style={{ animationDuration: '7s', animationDirection: 'reverse' }}
          />

          {/* Pulsing Concentric Aura */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-600/20 via-blue-900/40 to-amber-400/20 backdrop-blur-xs border border-amber-400/30 shadow-[0_0_25px_rgba(242,169,0,0.25)] flex items-center justify-center">
            
            {/* Center Crest Icon or Custom Logo */}
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Vault Seal" 
                className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(242,169,0,0.5)] animate-pulse"
              />
            ) : (
              <div className="relative flex items-center justify-center">
                <Shield className="w-12 h-12 text-amber-400 drop-shadow-[0_0_10px_rgba(242,169,0,0.6)]" />
                <Lock className="w-5 h-5 text-[#071322] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Orbiting Gold Sparks */}
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-300 rounded-full shadow-[0_0_10px_#f2a900] animate-ping"
            style={{ animationDuration: '2s' }}
          />
        </div>

        {/* Brand Typography */}
        <div className="space-y-1.5 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sovereign Physical Bullion Custody</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md">
            {brandTitle}
          </h1>

          <p className="text-xs text-slate-400 font-medium tracking-wide max-w-xs mx-auto">
            {brandSubtitle}
          </p>
        </div>

        {/* High-Precision Metallic Progress Bar */}
        <div className="w-full space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-mono px-1">
            <span className="text-amber-400/90 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              {securityStatuses[statusIndex].code}
            </span>
            <span className="text-white font-black text-sm tracking-wider">
              {progress}%
            </span>
          </div>

          {/* Bar Container */}
          <div className="relative w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-amber-500/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-500 transition-all duration-150 ease-out relative shadow-[0_0_12px_rgba(242,169,0,0.8)]"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer Light Reflection */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"
              />
            </div>
          </div>
        </div>

        {/* Live Security Handshake Status Text */}
        <div className="min-h-[36px] flex items-center justify-center px-4 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono transition-all duration-300">
          <span className="animate-in fade-in duration-200">
            {securityStatuses[statusIndex].text}
          </span>
        </div>

        {/* Trust Badges & Skip Option */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] text-slate-500 font-semibold tracking-wider">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-400">
              <Award className="w-3 h-3 text-amber-500" />
              LBMA 999.9 Certified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              FIPS 140-3 Segregated
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-amber-400/80 hover:text-amber-300 uppercase underline-offset-2 hover:underline cursor-pointer transition-colors p-1"
          >
            Skip intro
          </button>
        </div>

      </div>
    </div>
  );
};
