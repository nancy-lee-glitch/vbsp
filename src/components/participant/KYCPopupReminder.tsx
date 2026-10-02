import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  FileText, 
  UploadCloud, 
  Clock, 
  Lock, 
  Building2,
  ExternalLink,
  ShieldQuestion
} from 'lucide-react';
import { UserAccount } from '../../types';

interface KYCPopupReminderProps {
  user: UserAccount;
  onNavigateToKyc: () => void;
  activeSubView?: string;
}

export const KYCPopupReminder: React.FC<KYCPopupReminderProps> = () => {
  // KYC popup disabled per user request to prevent pop-up and white screen interruptions.
  // Participants can access KYC anytime from the dashboard navigation tab.
  return null;
};
