import { 
  TSPFund, 
  UserAccount, 
  TSPTransaction, 
  ParticipantMessage, 
  TSPDocument, 
  Announcement, 
  AuditLogEntry, 
  FraudAlert, 
  AgencyBulletin,
  PaymentMethodConfig 
} from '../types';

export const TSP_FUNDS: TSPFund[] = [
  {
    id: 'fund-g',
    code: 'G',
    name: 'Gold Sovereign Fund (G-Fund)',
    category: 'Core Individual Fund',
    description: '100% Allocated Physical Gold Bullion stored in high-security LBMA-approved vaults (Zurich, London, New York). Guarantees direct title ownership of .9999 fine gold with zero counterparty credit risk.',
    benchmark: 'LBMA Gold Price PM (USD/oz Spot Fixing)',
    riskLevel: 'Low',
    currentSharePrice: 94.65,
    oneMonthReturn: 1.85,
    ytdReturn: 24.80,
    oneYearReturn: 28.40,
    threeYearReturn: 14.90,
    fiveYearReturn: 16.25,
    tenYearReturn: 11.80,
    expenseRatio: '0.048%',
    inceptionYear: 1987,
    metalPurity: '.9999 Fine LBMA Good Delivery Bars',
    vaultLocation: 'Zurich (Malca-Amit) & London (Loomis)',
    assetComposition: [
      { asset: 'Allocated LBMA 400 oz Gold Bars', percentage: 85 },
      { asset: 'Minted 1 oz Sovereign Gold Coins (Eagles/Maple Leafs)', percentage: 15 }
    ]
  },
  {
    id: 'fund-s',
    code: 'S',
    name: 'Silver Reserve Fund (S-Fund)',
    category: 'Core Individual Fund',
    description: 'Physical Silver Bars and Minted Bullion Coins. Designed for high monetary beta and industrial demand hedging across solar, semiconductor, and sovereign monetary reserves.',
    benchmark: 'LBMA Silver Price Fixing Index (USD/oz)',
    riskLevel: 'Moderate-to-High',
    currentSharePrice: 86.30,
    oneMonthReturn: 2.40,
    ytdReturn: 29.60,
    oneYearReturn: 32.80,
    threeYearReturn: 16.40,
    fiveYearReturn: 18.10,
    tenYearReturn: 13.50,
    expenseRatio: '0.052%',
    inceptionYear: 2001,
    metalPurity: '.999 Fine Silver 1000 oz & 100 oz Bars',
    vaultLocation: 'London Vaults & New York COMEX Depository',
    assetComposition: [
      { asset: 'Allocated 1000 oz Good Delivery Silver Bars', percentage: 75 },
      { asset: 'Sovereign 1 oz Silver Mint Bullion', percentage: 25 }
    ]
  },
  {
    id: 'fund-p',
    code: 'P',
    name: 'Platinum & Rare Metals (P-Fund)',
    category: 'Core Individual Fund',
    description: 'Direct physical exposure to Platinum Group Metals (PGMs) including investment-grade Platinum and Palladium ingots, providing asymmetric upside in green hydrogen and catalytic technology.',
    benchmark: 'LPPM Platinum & Palladium Spot Price Index',
    riskLevel: 'High',
    currentSharePrice: 54.20,
    oneMonthReturn: 1.65,
    ytdReturn: 18.40,
    oneYearReturn: 19.80,
    threeYearReturn: 8.90,
    fiveYearReturn: 10.45,
    tenYearReturn: 7.90,
    expenseRatio: '0.058%',
    inceptionYear: 2008,
    metalPurity: '.9995 Investment-Grade Platinum/Palladium',
    vaultLocation: 'Zurich Freeport & Singapore Le Freeport',
    assetComposition: [
      { asset: 'Allocated Physical Platinum Ingots', percentage: 65 },
      { asset: 'Physical Palladium Sponge / Bars', percentage: 35 }
    ]
  },
  {
    id: 'fund-t',
    code: 'T',
    name: 'Treasury Cash & Liquidity (T-Fund)',
    category: 'Core Individual Fund',
    description: 'Cash liquidity, overnight sovereign repurchase agreements, and ultra-short government debt. Used for instant settlement, dry powder reserves, and daily automated bullion thrift execution.',
    benchmark: 'U.S. 3-Month Treasury Bill / SOFR Overnight Rate',
    riskLevel: 'Low',
    currentSharePrice: 19.42,
    oneMonthReturn: 0.38,
    ytdReturn: 4.65,
    oneYearReturn: 5.10,
    threeYearReturn: 4.25,
    fiveYearReturn: 3.20,
    tenYearReturn: 2.45,
    expenseRatio: '0.035%',
    inceptionYear: 1987,
    vaultLocation: 'Federal Reserve Bank & Tier-1 Settlement Banks',
    assetComposition: [
      { asset: 'Direct Sovereign Cash Reserves', percentage: 70 },
      { asset: 'Short-Term T-Bills (0-30 Day)', percentage: 30 }
    ]
  },
  {
    id: 'fund-m',
    code: 'M',
    name: 'Numismatic & Rare Coins (M-Fund)',
    category: 'Core Individual Fund',
    description: 'Curated portfolio of PCGS and NGC certified ultra-high-grade historical gold and silver coinage (Pre-1933 US Gold Eagles, Saint-Gaudens, Sovereign Crowns) offering non-correlated alpha.',
    benchmark: 'NumisMaster Certified Rare Coin Index',
    riskLevel: 'High',
    currentSharePrice: 42.10,
    oneMonthReturn: 1.15,
    ytdReturn: 15.80,
    oneYearReturn: 17.20,
    threeYearReturn: 11.20,
    fiveYearReturn: 13.40,
    tenYearReturn: 12.10,
    expenseRatio: '0.065%',
    inceptionYear: 2012,
    metalPurity: 'PCGS/NGC Certified Mint State MS-65+',
    vaultLocation: 'Brinks Deep Vault (New York & Geneva)',
    assetComposition: [
      { asset: 'Pre-1933 Certified US Gold Coinage', percentage: 55 },
      { asset: 'European Imperial Gold Sovereigns & Francs', percentage: 30 },
      { asset: 'Ancient & Ultra-Rare Numismatics', percentage: 15 }
    ]
  },
  {
    id: 'fund-l-preserve',
    code: 'L_PRESERVE',
    name: 'Vertex L-Preserve (Conservative / Income)',
    category: 'Lifecycle Fund',
    description: 'Pre-mixed automated strategy prioritizing capital preservation and steady store of value. Blends 70% Physical Gold (G-Fund), 20% Treasury Liquidity (T-Fund), and 10% Silver (S-Fund).',
    benchmark: 'Vertex Sovereign Conservative Composite',
    riskLevel: 'Low',
    currentSharePrice: 32.85,
    oneMonthReturn: 0.95,
    ytdReturn: 16.40,
    oneYearReturn: 18.10,
    threeYearReturn: 9.80,
    fiveYearReturn: 11.25,
    tenYearReturn: 8.90,
    expenseRatio: '0.045%',
    inceptionYear: 2015,
    assetComposition: [
      { asset: 'G-Fund (Gold Sovereign)', percentage: 70 },
      { asset: 'T-Fund (Treasury Liquidity)', percentage: 20 },
      { asset: 'S-Fund (Silver Reserve)', percentage: 10 }
    ]
  },
  {
    id: 'fund-l-balanced',
    code: 'L_BALANCED',
    name: 'Vertex L-Balanced (Core Accumulator)',
    category: 'Lifecycle Fund',
    description: 'The standard all-weather precious metals accumulator. Dynamically balances 50% Gold (G-Fund), 35% Silver (S-Fund), and 15% Platinum Group Metals (P-Fund).',
    benchmark: 'Vertex Multi-Metal Balanced Index',
    riskLevel: 'Moderate',
    currentSharePrice: 58.40,
    oneMonthReturn: 1.75,
    ytdReturn: 23.90,
    oneYearReturn: 26.50,
    threeYearReturn: 13.80,
    fiveYearReturn: 15.60,
    tenYearReturn: 12.40,
    expenseRatio: '0.048%',
    inceptionYear: 2015,
    assetComposition: [
      { asset: 'G-Fund (Gold Sovereign)', percentage: 50 },
      { asset: 'S-Fund (Silver Reserve)', percentage: 35 },
      { asset: 'P-Fund (Platinum/PGM)', percentage: 15 }
    ]
  },
  {
    id: 'fund-l-growth',
    code: 'L_GROWTH',
    name: 'Vertex L-Growth (Maximum Upside Strategy)',
    category: 'Lifecycle Fund',
    description: 'Engineered for aggressive metal volume compounding. Allocates 40% Silver (S-Fund), 30% Platinum (P-Fund), 20% Rare Numismatics (M-Fund), and 10% Gold (G-Fund).',
    benchmark: 'Vertex Bullion Alpha Growth Composite',
    riskLevel: 'High',
    currentSharePrice: 68.90,
    oneMonthReturn: 2.15,
    ytdReturn: 27.80,
    oneYearReturn: 30.40,
    threeYearReturn: 15.20,
    fiveYearReturn: 17.80,
    tenYearReturn: 14.10,
    expenseRatio: '0.054%',
    inceptionYear: 2018,
    assetComposition: [
      { asset: 'S-Fund (Silver Reserve)', percentage: 40 },
      { asset: 'P-Fund (Platinum/PGM)', percentage: 30 },
      { asset: 'M-Fund (Numismatics)', percentage: 20 },
      { asset: 'G-Fund (Gold Sovereign)', percentage: 10 }
    ]
  }
];

export const INITIAL_USER: UserAccount = {
  id: 'usr_vbsp_994821',
  name: 'Marcus Vance',
  email: 'marcus.vance@usda.gov',
  accountNumber: 'VBSP-0089-4412-98',
  thriftlinePin: '829415',
  employingAgency: 'Department of Agriculture / Private Reserve',
  planType: 'VBSP Sovereign Custody (Self-Directed / IRA)',
  hireDate: '2016-04-16',
  totalBalance: 342850.12,
  traditionalBalance: 246852.09, // Vaulted Segregated Bullion
  rothBalance: 95998.03, // Automated Bullion Thrift (ABT) Liquid Reserve
  ytdReturn: 22.8,
  vaultDepositaryLocation: 'Zurich Segregated Vault (Malca-Amit Depository CH-09)',
  goldOuncesEquivalent: 104.62,
  silverOuncesEquivalent: 1240.50,
  phone: '+1 (202) 555-0194',
  address: '1404 Potomac Ave SE, Suite 400, Washington, DC 20003',
  ytdContributions: {
    employee: 16500.00,
    agencyMatch: 6600.00,
    agencyAutomatic: 1650.00
  },
  contributionAllocations: {
    'G': 50,
    'S': 25,
    'L_BALANCED': 25
  },
  currentHoldings: [
    { fundCode: 'G', shares: 1811.14, sharePrice: 94.65, balance: 171425.06, percentage: 50.0, metalWeight: '64.69 oz Fine Gold' },
    { fundCode: 'S', shares: 993.19, sharePrice: 86.30, balance: 85712.53, percentage: 25.0, metalWeight: '993.19 oz Pure Silver' },
    { fundCode: 'L_BALANCED', shares: 1467.68, sharePrice: 58.40, balance: 85712.53, percentage: 25.0, metalWeight: 'Multi-Metal Target Mix' }
  ],
  beneficiaries: [
    {
      id: 'ben-01',
      type: 'Primary',
      name: 'Elena Vance (Spouse)',
      relationship: 'Spouse',
      sharePercentage: 80
    },
    {
      id: 'ben-02',
      type: 'Primary',
      name: 'Oliver Vance (Child)',
      relationship: 'Child',
      sharePercentage: 20
    },
    {
      id: 'ben-03',
      type: 'Contingent',
      name: 'Sarah Vance Miller (Sister)',
      relationship: 'Sibling',
      sharePercentage: 100
    }
  ],
  activeLoans: [
    {
      id: 'loan-4491',
      type: 'General Purpose',
      originalAmount: 15000.00,
      currentBalance: 8240.50,
      interestRate: 4.25,
      issueDate: '2024-03-01',
      termMonths: 48,
      repaymentPerPayPeriod: 170.11,
      status: 'Active',
      collateralAsset: 'Segregated Gold Sovereign Bar #LBMA-CH-99410',
      userId: 'usr_vbsp_994821',
      userName: 'Marcus Vance',
      userAccount: 'VBSP-0089-4412-98'
    }
  ],
  kycProfile: {
    overallStatus: 'Verified (Tier 1 Allocated)',
    verifiedDate: '2026-01-15',
    riskTier: 'Tier 1 Individual',
    ssnMasked: '***-**-4412',
    ssnDocument: {
      id: 'doc-ssn-default',
      type: 'ssn_card',
      title: 'Social Security Card (SSN Verification)',
      documentNumberMasked: '***-**-4412',
      issuingAuthority: 'Social Security Administration (SSA)',
      fileName: 'SSA_Card_Vance_M.pdf',
      fileSize: '1.4 MB',
      uploadedAt: '2026-01-14 10:22 AM',
      status: 'Verified',
      notes: 'SSN verified against federal records.'
    },
    driverLicenseFront: {
      id: 'doc-dl-front-default',
      type: 'driver_license_front',
      title: "Driver's License (Front Photo ID)",
      documentNumberMasked: 'VA-D8849****',
      issuingAuthority: 'Commonwealth of Virginia DMV',
      expirationDate: '2028-11-15',
      fileName: 'VA_DriverLicense_Front.jpg',
      fileSize: '2.8 MB',
      uploadedAt: '2026-01-14 10:25 AM',
      status: 'Verified'
    },
    driverLicenseBack: {
      id: 'doc-dl-back-default',
      type: 'driver_license_back',
      title: "Driver's License (Back Barcode)",
      documentNumberMasked: 'VA-D8849****',
      issuingAuthority: 'Commonwealth of Virginia DMV',
      expirationDate: '2028-11-15',
      fileName: 'VA_DriverLicense_Back.jpg',
      fileSize: '2.1 MB',
      uploadedAt: '2026-01-14 10:26 AM',
      status: 'Verified'
    },
    passportDocument: {
      id: 'doc-passport-default',
      type: 'passport',
      title: 'International Passport (Photo Identification Page)',
      documentNumberMasked: 'US-P9942****',
      issuingAuthority: 'U.S. Department of State',
      expirationDate: '2031-06-20',
      fileName: 'US_Passport_Booklet_Vance.jpg',
      fileSize: '3.6 MB',
      uploadedAt: '2026-01-14 10:30 AM',
      status: 'Verified',
      notes: 'Allocated precious metal international physical delivery authorized.'
    },
    additionalDocuments: [
      {
        id: 'doc-poa-default',
        type: 'proof_of_address',
        title: 'Proof of Residential Address (Utility Statement)',
        documentNumberMasked: 'UT-9941-88',
        issuingAuthority: 'Potomac Electric Power Company',
        fileName: 'Pepco_Utility_Bill_Jan2026.pdf',
        fileSize: '890 KB',
        uploadedAt: '2026-01-14 10:32 AM',
        status: 'Verified'
      }
    ]
  },
  transactions: [
    {
      id: 'tx-109',
      date: '2026-08-15',
      type: 'Automated Bullion Thrift (ABT Deposit)',
      description: 'Monthly recurring bullion allocation deposited to Gold Sovereign (G-Fund)',
      amount: 1250.00,
      metalEquivalent: '+0.472 oz Gold (.9999 LBMA)',
      status: 'Completed',
      userId: 'usr_vbsp_994821',
      userName: 'Marcus Vance',
      userAccount: 'VBSP-0089-4412-98'
    },
    {
      id: 'tx-108',
      date: '2026-08-15',
      type: 'Sovereign Match (4% Capture)',
      description: 'Institutional treasury matching contribution posted to Silver Reserve (S-Fund)',
      amount: 500.00,
      metalEquivalent: '+5.79 oz Pure Silver',
      status: 'Completed',
      userId: 'usr_vbsp_994821',
      userName: 'Marcus Vance',
      userAccount: 'VBSP-0089-4412-98'
    },
    {
      id: 'tx-107',
      date: '2026-08-01',
      type: 'Vault Storage & Insurance Fee',
      description: 'Lloyd\'s of London all-risk specie custody fee (0.004% per month)',
      amount: -13.71,
      status: 'Completed',
      userId: 'usr_vbsp_994821',
      userName: 'Marcus Vance',
      userAccount: 'VBSP-0089-4412-98'
    },
    {
      id: 'tx-106',
      date: '2026-07-28',
      type: 'Interfund Bullion Rebalance',
      description: 'Rebalanced 15% from T-Fund (Cash) into G-Fund (Gold Sovereign)',
      amount: 0.00,
      status: 'Completed',
      userId: 'usr_vbsp_994821',
      userName: 'Marcus Vance',
      userAccount: 'VBSP-0089-4412-98'
    }
  ]
};

export const MOCK_USERS: UserAccount[] = [
  INITIAL_USER,
  {
    id: 'usr_vbsp_104477',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@defense.gov',
    accountNumber: 'VBSP-1044-7712-30',
    thriftlinePin: '554411',
    employingAgency: 'Department of Defense (Civilian Cyber Command)',
    planType: 'VBSP Standard Account (Taxable Reserve)',
    hireDate: '2019-08-10',
    totalBalance: 184500.00,
    traditionalBalance: 120000.00,
    rothBalance: 64500.00,
    ytdReturn: 19.4,
    vaultDepositaryLocation: 'Delaware Depository Segregated Vault (DE-02)',
    goldOuncesEquivalent: 52.80,
    silverOuncesEquivalent: 840.00,
    phone: '+1 (703) 555-0182',
    address: '2200 Crystal Dr, Arlington, VA 22202',
    ytdContributions: {
      employee: 12000.00,
      agencyMatch: 4800.00,
      agencyAutomatic: 1200.00
    },
    contributionAllocations: {
      'G': 40,
      'S': 40,
      'P': 20
    },
    currentHoldings: [
      { fundCode: 'G', shares: 779.71, sharePrice: 94.65, balance: 73800.00, percentage: 40.0, metalWeight: '27.8 oz Fine Gold' },
      { fundCode: 'S', shares: 855.15, sharePrice: 86.30, balance: 73800.00, percentage: 40.0, metalWeight: '855.15 oz Pure Silver' },
      { fundCode: 'P', shares: 680.81, sharePrice: 54.20, balance: 36900.00, percentage: 20.0, metalWeight: '36.9 oz Fine Platinum' }
    ],
    beneficiaries: [
      {
        id: 'ben-sj-01',
        type: 'Primary',
        name: 'David Jenkins (Spouse)',
        relationship: 'Spouse',
        sharePercentage: 100
      }
    ],
    activeLoans: [
      {
        id: 'LOAN-2026-789',
        type: 'General Purpose',
        originalAmount: 10000,
        currentBalance: 10000,
        interestRate: 4.25,
        issueDate: '2026-08-28',
        termMonths: 36,
        repaymentPerPayPeriod: 144.20,
        status: 'Processing',
        collateralAsset: 'Silver Reserve S-Fund Collateral',
        userId: 'usr_vbsp_104477',
        userName: 'Sarah Jenkins',
        userAccount: 'VBSP-1044-7712-30',
        purpose: 'Bullion-backed personal emergency loan request'
      }
    ],
    kycProfile: {
      overallStatus: 'Pending Review',
      riskTier: 'Tier 1 Individual',
      ssnMasked: '***-**-7712',
      driverLicenseFront: {
        id: 'doc-sj-dl',
        type: 'driver_license_front',
        title: "Driver's License (Front Photo ID)",
        documentNumberMasked: 'VA-T9912****',
        issuingAuthority: 'Commonwealth of Virginia DMV',
        expirationDate: '2029-04-12',
        fileName: 'Sarah_Jenkins_VA_DL.jpg',
        fileSize: '2.4 MB',
        uploadedAt: '2026-08-28 09:14 AM',
        status: 'Pending Review',
        notes: 'Submitted for DMV & Identity verification'
      },
      proofOfAddressDocument: {
        id: 'doc-sj-poa',
        type: 'proof_of_address',
        title: 'Proof of Residential Address (Lease Agreement)',
        documentNumberMasked: 'LS-2200-CR',
        issuingAuthority: 'Arlington Residential Properties',
        fileName: 'Crystal_Dr_Lease_2026.pdf',
        fileSize: '1.9 MB',
        uploadedAt: '2026-08-28 09:16 AM',
        status: 'Pending Review',
        notes: 'Awaiting Super Admin address verification'
      },
      additionalDocuments: []
    },
    transactions: [
      {
        id: 'tx-sj-101',
        date: '2026-08-28',
        type: 'Deposit / Bullion Purchase',
        description: 'ACH Bullion Thrift Deferral to S-Fund (Silver Reserve)',
        amount: 2500.00,
        status: 'Pending',
        metalEquivalent: '+28.96 oz Silver',
        userId: 'usr_vbsp_104477',
        userName: 'Sarah Jenkins',
        userAccount: 'VBSP-1044-7712-30'
      }
    ]
  },
  {
    id: 'usr_vbsp_001928',
    name: 'Cadet Ryan Parker',
    email: 'ryan.parker@defense.gov',
    accountNumber: 'VBSP-2026-8819-42',
    thriftlinePin: '661199',
    employingAgency: 'Department of Defense (Naval Surface Warfare)',
    planType: 'VBSP Standard Account (Taxable Reserve)',
    hireDate: '2026-08-01',
    totalBalance: 0,
    traditionalBalance: 0,
    rothBalance: 0,
    ytdReturn: 0.0,
    vaultDepositaryLocation: 'Delaware Depository Segregated Vault',
    goldOuncesEquivalent: 0,
    silverOuncesEquivalent: 0,
    phone: '+1 (757) 555-0143',
    address: '1530 Gilbert St, Norfolk, VA 23511',
    ytdContributions: {
      employee: 0,
      agencyMatch: 0,
      agencyAutomatic: 0
    },
    contributionAllocations: {
      'G': 50,
      'S': 50
    },
    currentHoldings: [],
    beneficiaries: [],
    activeLoans: [],
    transactions: [], // Clean ledger: no transactions rendered yet
    kycProfile: {
      overallStatus: 'Not Verified',
      riskTier: 'Tier 1 Individual',
      ssnMasked: 'Unverified - Requires Submission',
      additionalDocuments: []
    }
  },
  {
    id: 'usr_vbsp_900233',
    name: 'Atlas Global Sovereign Reserve LLC',
    email: 'treasury@atlasreserves.com',
    accountNumber: 'VBSP-9002-3311-88',
    thriftlinePin: '992200',
    employingAgency: 'Institutional Treasury & Corporate Vaulting',
    planType: 'VBSP Institutional / Corporate Reserve',
    hireDate: '2021-01-15',
    totalBalance: 1250000.00,
    traditionalBalance: 1000000.00,
    rothBalance: 250000.00,
    ytdReturn: 24.6,
    vaultDepositaryLocation: 'London Bullion Market (LBMA Vaults - Loomis International)',
    goldOuncesEquivalent: 382.40,
    silverOuncesEquivalent: 4200.00,
    phone: '+1 (212) 555-0831',
    address: '450 Lexington Ave, 38th Floor, New York, NY 10017',
    ytdContributions: {
      employee: 70000.00,
      agencyMatch: 0.00,
      agencyAutomatic: 0.00
    },
    contributionAllocations: {
      'G': 60,
      'S': 20,
      'M': 20
    },
    currentHoldings: [
      { fundCode: 'G', shares: 7923.93, sharePrice: 94.65, balance: 750000.00, percentage: 60.0, metalWeight: '283.0 oz Allocated Gold Bars' },
      { fundCode: 'S', shares: 2896.87, sharePrice: 86.30, balance: 250000.00, percentage: 20.0, metalWeight: '2896.87 oz 1000oz COMEX Bars' },
      { fundCode: 'M', shares: 5938.24, sharePrice: 42.10, balance: 250000.00, percentage: 20.0, metalWeight: 'Certified Pre-1933 Gold Double Eagles' }
    ],
    beneficiaries: [
      {
        id: 'ben-at-01',
        type: 'Primary',
        name: 'Atlas Corporate Succession Trust',
        relationship: 'Institutional Entity Trust',
        sharePercentage: 100
      }
    ],
    activeLoans: [],
    kycProfile: {
      overallStatus: 'Verified (Tier 1 Allocated)',
      verifiedDate: '2026-01-20',
      riskTier: 'Tier 3 Institutional Treasury',
      ssnMasked: 'XX-XXX9922 (EIN)',
      additionalDocuments: []
    },
    transactions: [
      {
        id: 'tx-at-101',
        date: '2026-08-10',
        type: 'Institutional Wire Deposit',
        description: 'Corporate treasury gold reserve addition allocated to London LBMA Vaults',
        amount: 250000.00,
        status: 'Completed',
        metalEquivalent: '+94.34 oz Gold',
        userId: 'usr_vbsp_900233',
        userName: 'Atlas Global Sovereign Reserve LLC',
        userAccount: 'VBSP-9002-3311-88'
      }
    ]
  }
];


export const MOCK_TRANSACTIONS: TSPTransaction[] = [
  {
    id: 'tx-109',
    date: '2026-08-15',
    type: 'Automated Bullion Thrift (ABT Deposit)',
    description: 'Monthly recurring bullion allocation deposited to Gold Sovereign (G-Fund)',
    amount: 1250.00,
    metalEquivalent: '+0.472 oz Gold (.9999 LBMA)',
    status: 'Completed'
  },
  {
    id: 'tx-108',
    date: '2026-08-15',
    type: 'Sovereign Match (4% Capture)',
    description: 'Institutional treasury matching contribution posted to Silver Reserve (S-Fund)',
    amount: 500.00,
    metalEquivalent: '+5.79 oz Pure Silver',
    status: 'Completed'
  },
  {
    id: 'tx-107',
    date: '2026-08-01',
    type: 'Vault Storage & Insurance Fee',
    description: 'Lloyd\'s of London all-risk specie custody fee (0.004% per month)',
    amount: -13.71,
    status: 'Completed'
  },
  {
    id: 'tx-106',
    date: '2026-07-28',
    type: 'Interfund Bullion Rebalance',
    description: 'Rebalanced 15% from T-Fund (Cash) into G-Fund (Gold Sovereign)',
    amount: 0.00,
    status: 'Completed'
  },
  {
    id: 'tx-105',
    date: '2026-07-15',
    type: 'Automated Bullion Thrift (ABT Deposit)',
    description: 'Monthly recurring bullion allocation deposited to Core Funds',
    amount: 1250.00,
    metalEquivalent: '+0.472 oz Gold',
    status: 'Completed'
  }
];

export const MOCK_MESSAGES: ParticipantMessage[] = [
  {
    id: 'msg-01',
    sender: 'VBSP Custody Operations',
    subject: 'Confirmation: Automated Bullion Thrift (ABT) Allocation Update',
    timestamp: '2026-08-01 09:30 AM',
    body: 'Dear Marcus Vance,\n\nYour monthly Automated Bullion Thrift (ABT) instruction has been processed. Your next scheduled bullion deposit will be allocated as follows:\n- Gold Sovereign Fund (G-Fund): 50%\n- Silver Reserve Fund (S-Fund): 25%\n- Vertex L-Balanced Portfolio: 25%\n\nPhysical metal allocation receipts with matching LBMA assay serial numbers are accessible in your Documents Center.\n\nSincerely,\nVertex Bullion Savings Plan Custody Operations',
    isRead: false,
    hasAttachments: false
  },
  {
    id: 'msg-02',
    sender: 'Zurich Vault Depository',
    subject: 'Quarter 2, 2026 Independent Physical Bullion Audit Statement Available',
    timestamp: '2026-07-10 02:15 PM',
    body: 'Your quarterly physical bar weight audit, conducted by Inspectorate International / Bureau Veritas in Zurich Vault #CH-09, is now available for download. All 104.62 oz of Gold and 1,240.50 oz of Silver remain 100% allocated in segregated accounts.',
    isRead: true,
    hasAttachments: true
  },
  {
    id: 'msg-03',
    sender: 'VBSP Senior Vault Officer (R. Sterling)',
    subject: 'Response to Inquiry #88192: Physical Bullion Delivery & Armored Transport',
    timestamp: '2026-06-18 11:45 AM',
    body: 'Hello Marcus,\n\nRegarding your inquiry on taking physical delivery of vaulted metal:\n\nMembers holding VBSP Sovereign Custody or Standard accounts may request physical delivery at any time via Form VBSP-19. Shipments are transported via insured armored carrier (Brinks / Malca-Amit) directly to your verified residential address or designated bank vault.\n\nPlease let us know if you require customs export documentation.\n\nWarm regards,\nR. Sterling\nSenior Vault & Depository Custodian',
    isRead: true,
    hasAttachments: false
  }
];

export const MOCK_DOCUMENTS: TSPDocument[] = [
  {
    id: 'doc-vbsp-1',
    title: 'VBSP-1: Member Bullion Election & Contribution Form',
    formNumber: 'VBSP-1',
    category: 'Forms',
    lastUpdated: '2026-01-15',
    fileSize: '340 KB',
    downloadUrl: '#',
    description: 'Used by account holders to start, modify, or pause Automated Bullion Thrift (ABT) monthly recurring allocations.'
  },
  {
    id: 'doc-vbsp-3',
    title: 'VBSP-3: Designation of Sovereign Beneficiary',
    formNumber: 'VBSP-3',
    category: 'Forms',
    lastUpdated: '2025-11-04',
    fileSize: '410 KB',
    downloadUrl: '#',
    description: 'Designate primary and contingent beneficiaries for immediate physical metal title transfer upon passing.'
  },
  {
    id: 'doc-vbsp-19',
    title: 'VBSP-19: Request for Physical Bullion Vault Delivery',
    formNumber: 'VBSP-19',
    category: 'Forms',
    lastUpdated: '2026-02-01',
    fileSize: '520 KB',
    downloadUrl: '#',
    description: 'Request physical withdrawal and insured armored transport (Brinks/Loomis) of allocated gold or silver bars.'
  },
  {
    id: 'doc-vbsp-65',
    title: 'VBSP-65: Bullion-Backed Liquidity & Credit Facility Request',
    formNumber: 'VBSP-65',
    category: 'Forms',
    lastUpdated: '2026-01-20',
    fileSize: '480 KB',
    downloadUrl: '#',
    description: 'Access low-interest cash liquidity up to 50% of your vaulted metal value without selling your bullion.'
  },
  {
    id: 'doc-audit-report',
    title: 'Q2 2026 Independent Depository Audit & Bar List (Zurich/London)',
    category: 'Vault Audit',
    lastUpdated: '2026-07-01',
    fileSize: '4.8 MB',
    downloadUrl: '#',
    description: 'Bureau Veritas certified physical bar list, purity assays, and Lloyd\'s of London $1B specie insurance certificate.'
  },
  {
    id: 'doc-vbsp-guide',
    title: 'Vertex Bullion Savings Plan (VBSP) Institutional Handbook',
    category: 'Publications',
    lastUpdated: '2026-01-01',
    fileSize: '2.8 MB',
    downloadUrl: '#',
    description: 'Complete 52-page guide covering account types, core funds, target lifecycle mixes, and tax-deferred precious metals custody.'
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    title: '2026 Sovereign Deferral & Precious Metals Contribution Guidelines Published',
    date: '2026-01-05',
    category: 'General',
    summary: 'The 2026 statutory elective savings limit for precious metals reserves is established at $23,500 with $7,500 catch-up for eligible members.',
    isUrgent: false
  },
  {
    id: 'ann-02',
    title: 'New Zurich Segregated Vault Facility CH-09 Commissioned',
    date: '2026-05-12',
    category: 'Vault Audit',
    summary: 'VBSP has expanded allocated vault capacity in Zurich with state-of-the-art robotic biometric storage and Lloyd\'s 100% all-risk specie underwriting.',
    isUrgent: false
  },
  {
    id: 'ann-03',
    title: 'Scheduled Vault Settlement Maintenance Window',
    date: '2026-08-20',
    category: 'Maintenance',
    summary: 'Automated Bullion Thrift settlement ledger will undergo routine maintenance on Sunday, September 6 between 1:00 AM - 4:00 AM ET.',
    isUrgent: false
  }
];

export const MOCK_NEWS = MOCK_ANNOUNCEMENTS;

export const MOCK_AGENCY_BULLETINS: AgencyBulletin[] = [
  {
    id: 'bul-26-1',
    bulletinNumber: 'VBSP-BUL-2026-01',
    title: '2026 Automated Bullion Thrift (ABT) Technical Integration Specs for Corporate Payrolls',
    date: '2026-01-02',
    effectiveDate: '2026-01-01',
    category: 'Payroll Technical Specification',
    summary: 'Guidance for corporate payroll systems and institutional treasuries on establishing direct recurring pre-tax and after-tax bullion deposits.'
  },
  {
    id: 'bul-26-2',
    bulletinNumber: 'VBSP-BUL-2026-02',
    title: 'LBMA Chain of Custody Standards for Institutional Corporate Reserves',
    date: '2026-03-15',
    effectiveDate: '2026-04-01',
    category: 'Compliance & Regulations',
    summary: 'Protocol specifications for verified Good Delivery bar serial tracking and quarterly external assay reconciliations.'
  }
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-8801',
    timestamp: '2026-08-27 10:42:15',
    actor: 'Executive Administrator (FRTIB-VBSP)',
    action: 'VAULT_PRICE_OVERRIDE',
    details: 'Published updated daily spot closing prices across G-Fund ($94.65), S-Fund ($86.30), and P-Fund ($54.20).',
    ipAddress: '10.240.1.18 (VBSP-HQ-VPC)',
    status: 'Success'
  },
  {
    id: 'log-8800',
    timestamp: '2026-08-27 09:15:30',
    actor: 'Marcus Vance (VBSP-0089-4412-98)',
    action: 'MFA_CHALLENGE_SUCCESS',
    details: 'Biometric physical hardware key authentication verified for vault account access.',
    ipAddress: '198.51.100.42 (US-East)',
    status: 'Success'
  },
  {
    id: 'log-8799',
    timestamp: '2026-08-26 18:22:04',
    actor: 'Depository Auditor (Bureau Veritas)',
    action: 'PHYSICAL_VAULT_AUDIT_PASS',
    details: 'Completed physical bar weight and assay scan across all allocated depository lockers. 100% reserve backing verified.',
    ipAddress: '195.176.24.12 (Zurich-HQ)',
    status: 'Success'
  }
];

export const MOCK_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'fraud-01',
    targetAccount: 'VBSP-0041-9923-11',
    type: 'Large Out-of-Pattern Transfer',
    severity: 'High',
    description: 'Withdrawal request of $48,000 initiated within 4 hours of phone number and email change from foreign ASN.',
    timestamp: '2026-08-25 14:02:11',
    status: 'Open'
  },
  {
    id: 'fraud-02',
    targetAccount: 'VBSP-4410-1892',
    type: 'Rapid Password & PIN Change',
    severity: 'Medium',
    description: '3 failed ThriftLine PIN attempts followed by immediate online password reset from unknown TOR exit node.',
    timestamp: '2026-08-26 03:12:44',
    status: 'Open'
  }
];

export const DEFAULT_SITE_BRANDING = {
  siteName: 'VERTEX BULLION SAVINGS PLAN (VBSP)',
  siteSubtitle: 'Institutional Precious Metals Thrift & Sovereign Bullion Custody Board',
  siteDomain: 'VBSP.ORG',
  logoUrl: null,
  sealText: 'Official Vault Custody & Bullion Savings Reserve • LBMA Good Delivery Certified',
  supportPhone: '1-800-VBSP-THRIFT (827-7877)',
  supportEmail: 'custody@vbsp.org'
};

export const INITIAL_EMAIL_DISPATCHES: any[] = [
  {
    id: 'dispatch-101',
    subject: 'Quarterly Physical Vault Specie Re-Assay Certificate (Q3 2026)',
    body: 'Dear {{name}},\n\nThis official notification certifies that your allocated precious metal holdings in {{plan_type}} (Account: {{account_number}}) have been audited by Bureau Veritas at {{vault_location}}.\n\nAll allocated LBMA-certified bars and sovereign minted bullion remain 100% physically backed with zero hypothecation. Your current audited portfolio valuation is ${{total_balance}}.\n\nThank you for choosing the Vertex Bullion Savings Plan.',
    senderName: 'Vertex Bullion Custody Service',
    senderEmail: 'custody-notifications@vbsp.org',
    recipientType: 'all',
    recipientTargetDescription: 'All Registered Plan Participants (Broadcast)',
    recipientCount: 5,
    recipientNames: ['Marcus Vance', 'Arthur Vance', 'Sarah Jenkins', 'David Chen', 'Elena Rostova'],
    recipientEmails: ['marcus.vance@defense.gov', 'arthur.vance@defense.gov', 'sarah.jenkins@usda.gov', 'david.chen@treasury.gov', 'elena.rostova@corporate.vertex.io'],
    timestamp: '2026-08-27 08:30:00',
    priority: 'Important',
    templateName: 'Annual Vault Specie Audit Certificate',
    status: 'Delivered'
  },
  {
    id: 'dispatch-102',
    subject: '2026 Statutory Bullion Elective Deferral Limits & Matching Updates',
    body: 'Dear Participant,\n\nPlease be advised that the 2026 standard elective deferral limit has been statutory confirmed at $23,500 with a $7,500 age-50+ catch-up provision. Ensure your agency payroll deduction schedules are aligned.\n\nVertex Bullion Savings Plan Administration.',
    senderName: 'VBSP Compliance & Regulatory Office',
    senderEmail: 'compliance@vbsp.org',
    recipientType: 'all',
    recipientTargetDescription: 'All Registered Plan Participants (Broadcast)',
    recipientCount: 5,
    recipientNames: ['All Participants'],
    recipientEmails: ['broadcast@vbsp.org'],
    timestamp: '2026-08-25 11:15:22',
    priority: 'Normal',
    templateName: 'Contribution Limit & Payroll Notice',
    status: 'Delivered'
  }
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'pay-bank-wire-01',
    name: 'Fedwire / U.S. Federal Depository Wire',
    category: 'bank_transfer',
    isEnabled: true,
    badgeText: 'Federal Depository Wire',
    bankName: 'Federal Reserve Bank & JPMorgan Chase Depository Trust',
    accountHolderName: 'Vertex Bullion Savings Plan Treasury Depository Trust',
    accountNumber: '772091482019',
    routingNumber: '021000021',
    swiftBic: 'CHASUS33XXX',
    bankAddress: '383 Madison Avenue, New York, NY 10017',
    minDepositUsd: 5000,
    maxDepositUsd: 300000,
    processingTime: 'Same-Day Fedwire Settlement',
    instructions: 'Initiate domestic Fedwire or international SWIFT wire using the exact credentials above. Include your VBSP Account Number in Wire Remittance Memo (Field 70) for automated ledger matching.',
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-crypto-btc-01',
    name: 'Bitcoin (BTC)',
    category: 'crypto',
    isEnabled: true,
    badgeText: 'Native SegWit Vault',
    coinSymbol: 'BTC',
    network: 'Bitcoin Mainnet (Native SegWit bc1q)',
    walletAddress: 'bc1qv98d7kx2m94flltq0x86y32p5zwcjh4r6k7j3m',
    minDepositUsd: 5000,
    maxDepositUsd: 300000,
    processingTime: '1-2 Network Confirmations (~15 mins)',
    instructions: 'Transfer Bitcoin directly to our institutional multi-signature cold vault address. Ensure you are sending native BTC on the Bitcoin network.',
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-crypto-usdt-trc20',
    name: 'Tether USDT (TRC-20)',
    category: 'crypto',
    isEnabled: true,
    badgeText: 'Instant / Low Gas',
    coinSymbol: 'USDT',
    network: 'Tron Network (TRC-20)',
    walletAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    minDepositUsd: 5000,
    maxDepositUsd: 300000,
    processingTime: 'Instant (~3 mins)',
    instructions: 'Send exact USDT amount on the TRON (TRC-20) network. Do not dispatch via other networks to avoid irreversible loss.',
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-crypto-eth-01',
    name: 'Ethereum (ETH / ERC-20)',
    category: 'crypto',
    isEnabled: true,
    badgeText: 'Institutional Custody',
    coinSymbol: 'ETH',
    network: 'Ethereum Mainnet (ERC-20)',
    walletAddress: '0x71C8366420A092679b5430F732661B2c80D5230d',
    minDepositUsd: 5000,
    maxDepositUsd: 300000,
    processingTime: '12 Confirmations (~5 mins)',
    instructions: 'Send ETH or supported ERC-20 stablecoins to our institutional custody smart vault address.',
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-crypto-usdc-sol',
    name: 'USDC (Solana SPL)',
    category: 'crypto',
    isEnabled: true,
    badgeText: 'Fastest Settlement',
    coinSymbol: 'USDC',
    network: 'Solana Network (SPL)',
    walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    minDepositUsd: 5000,
    maxDepositUsd: 300000,
    processingTime: 'Under 1 minute',
    instructions: 'Send Solana SPL USDC to this verified treasury receiver address.',
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-cashapp-01',
    name: 'Cash App Remittance',
    category: 'cashapp',
    isEnabled: true,
    badgeText: 'Instant Mobile Transfer',
    cashAppTag: '$VBSPVaultReserve',
    recipientName: 'Vertex Bullion Custody Service',
    minDepositUsd: 5000,
    maxDepositUsd: 300000,
    processingTime: 'Instant Clearing',
    instructions: 'Send payment via Cash App to $VBSPVaultReserve. In the Note / For field, enter your VBSP Account Number. Take a screenshot of the completed payment.',
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-paypal-01',
    name: 'PayPal Official Vault Clearing',
    category: 'paypal',
    isEnabled: true,
    badgeText: 'Buyer & Seller Protection',
    payPalEmail: 'clearing@vbsp-custody.org',
    recipientName: 'Vertex Bullion Savings Custody Corp',
    minDepositUsd: 5000,
    maxDepositUsd: 300000,
    processingTime: '10-30 Mins',
    instructions: 'Send payment via PayPal to clearing@vbsp-custody.org. Select Goods & Services or Commercial Remittance and specify your VBSP Account ID.',
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-zelle-01',
    name: 'Zelle Instant Bank Settlement',
    category: 'zelle',
    isEnabled: true,
    badgeText: 'Zero-Fee Direct Bank Transfer',
    zelleIdentifier: 'depository@vbsp.org',
    recipientName: 'Vertex Bullion Savings Plan LLC',
    minDepositUsd: 5000,
    maxDepositUsd: 300000,
    processingTime: 'Instant Settlement',
    instructions: 'Enroll with Zelle in your mobile banking application and send to depository@vbsp.org. Verify that the registered name displays "Vertex Bullion Savings Plan LLC". Include your Account ID in the memo.',
    createdAt: '2026-01-01'
  }
];


