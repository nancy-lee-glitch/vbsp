import { UserAccount } from '../types';
import { INITIAL_USER } from '../data/mockData';

/**
 * Normalizes any raw user object (from API, localStorage, or state) into a complete,
 * type-safe UserAccount object. Guarantees that arrays, objects, and numbers are always
 * present and never undefined, preventing any blank-screen rendering crashes.
 */
export function sanitizeUserAccount(raw: any, fallbackUser?: UserAccount | null): UserAccount {
  if (!raw && !fallbackUser) {
    return INITIAL_USER;
  }

  const base = fallbackUser || INITIAL_USER;
  const totalBal = Number(raw?.totalBalance ?? raw?.total_balance ?? base?.totalBalance ?? 0);
  const tradBal = Number(raw?.traditionalBalance ?? raw?.traditional_balance ?? (base?.traditionalBalance ?? (totalBal * 0.72)));
  const rothBal = Number(raw?.rothBalance ?? raw?.roth_balance ?? (base?.rothBalance ?? (totalBal * 0.28)));
  const gOz = Number(raw?.goldOuncesEquivalent ?? raw?.gold_ounces_equivalent ?? (base?.goldOuncesEquivalent ?? (totalBal > 0 ? (totalBal * 0.5) / 2750 : 0)));
  const sOz = Number(raw?.silverOuncesEquivalent ?? raw?.silver_ounces_equivalent ?? (base?.silverOuncesEquivalent ?? (totalBal > 0 ? (totalBal * 0.3) / 34.2 : 0)));

  // Generate safe holdings if missing or empty
  let holdings = Array.isArray(raw?.currentHoldings) && raw.currentHoldings.length > 0
    ? raw.currentHoldings
    : (Array.isArray(base?.currentHoldings) && base.currentHoldings.length > 0 ? base.currentHoldings : []);

  if (holdings.length === 0 && totalBal > 0) {
    holdings = [
      { fundCode: 'G', shares: Number(((totalBal * 0.5) / 68.45).toFixed(2)), sharePrice: 68.45, balance: Number((totalBal * 0.5).toFixed(2)), percentage: 50.0, metalWeight: `${gOz.toFixed(2)} oz LBMA Gold` },
      { fundCode: 'S', shares: Number(((totalBal * 0.3) / 34.20).toFixed(2)), sharePrice: 34.20, balance: Number((totalBal * 0.3).toFixed(2)), percentage: 30.0, metalWeight: `${sOz.toFixed(2)} oz Pure Silver` },
      { fundCode: 'T', shares: Number(((totalBal * 0.2) / 19.42).toFixed(2)), sharePrice: 19.42, balance: Number((totalBal * 0.2).toFixed(2)), percentage: 20.0, metalWeight: 'Short-Term Yield' }
    ];
  }

  const allocations = raw?.contributionAllocations && typeof raw.contributionAllocations === 'object' && Object.keys(raw.contributionAllocations).length > 0
    ? raw.contributionAllocations
    : (base?.contributionAllocations && Object.keys(base.contributionAllocations).length > 0 ? base.contributionAllocations : { 'G': 50, 'S': 30, 'T': 20 });

  const activeLoans = Array.isArray(raw?.activeLoans) ? raw.activeLoans : (Array.isArray(base?.activeLoans) ? base.activeLoans : []);
  const beneficiaries = Array.isArray(raw?.beneficiaries) ? raw.beneficiaries : (Array.isArray(base?.beneficiaries) ? base.beneficiaries : []);
  const transactions = Array.isArray(raw?.transactions) ? raw.transactions : (Array.isArray(base?.transactions) ? base.transactions : []);
  const withdrawalRequests = Array.isArray(raw?.withdrawalRequests) ? raw.withdrawalRequests : (Array.isArray(base?.withdrawalRequests) ? base.withdrawalRequests : []);

  const ytdContrib = raw?.ytdContributions && typeof raw.ytdContributions === 'object'
    ? {
        employee: Number(raw.ytdContributions.employee || 0),
        agencyMatch: Number(raw.ytdContributions.agencyMatch || 0),
        agencyAutomatic: Number(raw.ytdContributions.agencyAutomatic || 0)
      }
    : (base?.ytdContributions || {
        employee: Number((totalBal * 0.05).toFixed(2)),
        agencyMatch: Number((totalBal * 0.04).toFixed(2)),
        agencyAutomatic: Number((totalBal * 0.01).toFixed(2))
      });

  const kycStatus = raw?.kycProfile?.overallStatus || raw?.kycStatus || raw?.kyc_status || base?.kycProfile?.overallStatus || 'Pending Review';

  const rawHireDate = raw?.hireDate || raw?.hire_date || base?.hireDate;
  let formattedHireDate = '2020-03-15';
  if (rawHireDate) {
    if (typeof rawHireDate === 'string') {
      formattedHireDate = rawHireDate.includes('T') ? rawHireDate.split('T')[0] : rawHireDate;
    } else if (rawHireDate instanceof Date && !isNaN(rawHireDate.getTime())) {
      formattedHireDate = rawHireDate.toISOString().split('T')[0];
    } else {
      try {
        formattedHireDate = new Date(rawHireDate).toISOString().split('T')[0];
      } catch {
        formattedHireDate = '2020-03-15';
      }
    }
  }

  const rawId = raw?.id ?? base?.id;
  const cleanId = (rawId !== undefined && rawId !== null && String(rawId) !== 'NaN') ? String(rawId) : '1';

  return {
    id: cleanId,
    name: String(raw?.name || raw?.full_name || base?.name || 'Allocated Vault Participant'),
    accountNumber: String(raw?.accountNumber || raw?.account_number || base?.accountNumber || ''),
    thriftlinePin: String(raw?.thriftlinePin ?? raw?.thriftline_pin ?? base?.thriftlinePin ?? '829415'),
    email: String(raw?.email || base?.email || ''),
    phone: String(raw?.phone || base?.phone || '(202) 555-0149'),
    address: String(raw?.address || base?.address || '400 7th St SW, Washington, DC 20024'),
    employingAgency: String(raw?.employingAgency || raw?.employing_agency || raw?.agency || base?.employingAgency || 'Department of Defense (DoD)'),
    planType: String(raw?.planType || raw?.accountType || raw?.account_type || base?.planType || 'CCSP Sovereign Custody (Self-Directed / IRA)'),
    hireDate: formattedHireDate,
    totalBalance: isNaN(totalBal) || !isFinite(totalBal) ? 0 : totalBal,
    traditionalBalance: isNaN(tradBal) || !isFinite(tradBal) ? 0 : tradBal,
    rothBalance: isNaN(rothBal) || !isFinite(rothBal) ? 0 : rothBal,
    ytdReturn: Number(raw?.ytdReturn ?? raw?.ytd_return ?? base?.ytdReturn ?? 18.4),
    vaultDepositaryLocation: String(raw?.vaultDepositaryLocation || raw?.vault_facility || base?.vaultDepositaryLocation || 'Zurich FreePort / Delaware Depository Segregated Vault'),
    goldOuncesEquivalent: Number((isNaN(gOz) || !isFinite(gOz) ? 0 : gOz).toFixed(4)),
    silverOuncesEquivalent: Number((isNaN(sOz) || !isFinite(sOz) ? 0 : sOz).toFixed(4)),
    ytdContributions: ytdContrib,
    contributionAllocations: allocations,
    currentHoldings: holdings,
    beneficiaries,
    activeLoans,
    transactions,
    withdrawalRequests,
    kycProfile: raw?.kycProfile || {
      overallStatus: kycStatus,
      riskTier: 'Tier 1 Individual',
      ssnMasked: raw?.ssnLast4 ? `***-**-${raw.ssnLast4}` : (raw?.ssn_last4 ? `***-**-${raw.ssn_last4}` : '***-**-4412'),
      additionalDocuments: []
    }
  };
}
