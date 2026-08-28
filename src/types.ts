export type AppView = 
  | 'public' 
  | 'participant' 
  | 'agency' 
  | 'admin';

export type PortalView = 
  | 'public_home' 
  | 'public_funds' 
  | 'public_calculators' 
  | 'public_education' 
  | 'public_forms' 
  | 'public_contact' 
  | 'public_security' 
  | 'participant_dashboard' 
  | 'agency_portal' 
  | 'admin_portal';

export type ParticipantSubView = 
  | 'overview' 
  | 'investments' 
  | 'loans' 
  | 'withdrawals' 
  | 'beneficiaries' 
  | 'documents' 
  | 'history' 
  | 'messages' 
  | 'kyc'
  | 'settings';

export type PublicTab = 
  | 'home' 
  | 'education' 
  | 'funds' 
  | 'calculators' 
  | 'forms' 
  | 'contact' 
  | 'security-privacy';

export type ParticipantTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'allocation' 
  | 'loans' 
  | 'withdrawals' 
  | 'beneficiaries' 
  | 'mailbox' 
  | 'documents' 
  | 'settings' 
  | 'live-chat';

export type AgencyTab = 
  | 'bulletins' 
  | 'training' 
  | 'payroll-resources' 
  | 'historical-data' 
  | 'agency-forms' 
  | 'media-gallery' 
  | 'election-guidance';

export type AdminTab = 
  | 'prices' 
  | 'participants' 
  | 'email-center'
  | 'branding'
  | 'cms' 
  | 'audit' 
  | 'fraud' 
  | 'parameters';

export interface SiteBrandingSettings {
  siteName: string;
  siteSubtitle: string;
  siteDomain: string;
  logoUrl: string | null;
  sealText: string;
  supportPhone: string;
  supportEmail: string;
}

export interface AdminEmailDispatch {
  id: string;
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
  recipientType: 'all' | 'classification' | 'single' | 'selected';
  recipientTargetDescription: string;
  recipientCount: number;
  recipientNames: string[];
  recipientEmails: string[];
  timestamp: string;
  priority: 'Normal' | 'Important' | 'Urgent Vault Notice';
  templateName?: string;
  status: 'Sent' | 'Delivered' | 'Queued';
}

export type ContrastMode = 'normal' | 'high-contrast' | 'sepia' | 'high';
export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';
export type Language = 'en' | 'es';

export type VBSPAccountType = 
  | 'VBSP Standard Account (Taxable Reserve)'
  | 'VBSP Sovereign Custody (Self-Directed / IRA)'
  | 'VBSP Institutional / Corporate Reserve';

export interface TSPFund {
  id: string;
  code: string;
  name: string;
  category: 'Core Individual Fund' | 'Lifecycle Fund';
  description: string;
  benchmark: string;
  riskLevel: 'Low' | 'Low-to-Moderate' | 'Moderate' | 'Moderate-to-High' | 'High';
  currentSharePrice: number;
  oneMonthReturn: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  tenYearReturn: number;
  expenseRatio: string;
  inceptionYear: number;
  metalPurity?: string;
  vaultLocation?: string;
  assetComposition: { asset: string; percentage: number }[];
}

export interface TSPBeneficiary {
  id: string;
  type: 'Primary' | 'Contingent';
  name: string;
  relationship: string;
  sharePercentage: number;
}

export type Beneficiary = TSPBeneficiary;

export interface TSPLoan {
  id: string;
  type: 'General Purpose' | 'Residential';
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  issueDate: string;
  termMonths: number;
  repaymentPerPayPeriod: number;
  status: 'Active' | 'Paid' | 'Processing';
  collateralAsset?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'Checking' | 'Savings' | 'Corporate Wire';
  routingNumberMasked: string;
  accountNumberMasked: string;
  isPrimary: boolean;
}

export interface TSPTransaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Processed';
  metalEquivalent?: string;
}

export type TransactionRecord = TSPTransaction;

export interface ParticipantMessage {
  id: string;
  sender: string;
  recipient?: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  hasAttachments?: boolean;
}

export type SecureMessage = ParticipantMessage;

export interface TSPDocument {
  id: string;
  title: string;
  formNumber?: string;
  category: 'Forms' | 'Fact Sheets' | 'Publications' | 'Tax' | 'Statements' | 'Vault Audit';
  lastUpdated: string;
  fileSize: string;
  downloadUrl?: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'General' | 'Tax Notice' | 'Regulatory' | 'Maintenance' | 'Vault Audit';
  summary: string;
  isUrgent?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Flagged' | 'Blocked';
}

export type AuditLog = AuditLogEntry;

export interface FraudAlert {
  id: string;
  type: string;
  targetAccount: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  timestamp: string;
  status: 'Open' | 'Resolved' | 'Under Review';
}

export interface AgencyBulletin {
  id: string;
  bulletinNumber: string;
  title: string;
  date: string;
  effectiveDate: string;
  category: string;
  summary: string;
}

export type IdentificationDocType = 
  | 'ssn_card' 
  | 'driver_license_front' 
  | 'driver_license_back' 
  | 'passport' 
  | 'proof_of_address' 
  | 'corporate_resolution';

export interface IdentificationDocument {
  id: string;
  type: IdentificationDocType;
  title: string;
  documentNumberMasked?: string;
  issuingAuthority?: string;
  expirationDate?: string;
  fileName: string;
  fileDataUrl?: string;
  fileSize: string;
  uploadedAt: string;
  status: 'Verified' | 'Pending Review' | 'Under Vault Assay Review' | 'Action Required';
  notes?: string;
}

export interface KYCVerificationProfile {
  overallStatus: 'Verified (Tier 1 Allocated)' | 'Pending Review' | 'Requires Documentation' | 'Under Vault Compliance Review';
  verifiedDate?: string;
  riskTier: 'Tier 1 Individual' | 'Tier 2 High-Net-Worth' | 'Tier 3 Institutional Treasury';
  ssnMasked: string;
  ssnDocument?: IdentificationDocument;
  driverLicenseFront?: IdentificationDocument;
  driverLicenseBack?: IdentificationDocument;
  passportDocument?: IdentificationDocument;
  proofOfAddressDocument?: IdentificationDocument;
  additionalDocuments: IdentificationDocument[];
  complianceOfficerNotes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  accountNumber: string;
  thriftlinePin: string;
  password?: string;
  email: string;
  phone: string;
  address: string;
  employingAgency: string;
  planType: VBSPAccountType;
  hireDate: string;
  totalBalance: number;
  traditionalBalance: number; // Vaulted Segregated Bullion
  rothBalance: number; // Liquid / ABT Bullion Reserve
  ytdReturn: number;
  vaultDepositaryLocation?: string;
  goldOuncesEquivalent?: number;
  silverOuncesEquivalent?: number;
  ytdContributions: {
    employee: number;
    agencyMatch: number;
    agencyAutomatic: number;
  };
  contributionAllocations: Record<string, number>;
  currentHoldings: {
    fundCode: string;
    shares: number;
    sharePrice: number;
    balance: number;
    percentage: number;
    metalWeight?: string;
  }[];
  beneficiaries: TSPBeneficiary[];
  activeLoans: TSPLoan[];
  kycProfile?: KYCVerificationProfile;
}
