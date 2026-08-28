export interface RetirementModelerInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentBalance: number;
  annualSalary: number;
  employeeContributionPercent: number; // e.g. 5%
  agencyMatchPercent: number; // e.g. 5% for FERS
  salaryGrowthRate: number; // e.g. 2.5%
  preRetirementReturnRate: number; // e.g. 7.0%
  postRetirementReturnRate: number; // e.g. 4.5%
  inflationRate: number; // e.g. 2.5%
}

export interface YearProjection {
  age: number;
  year: number;
  salary: number;
  employeeContribution: number;
  agencyContribution: number;
  totalContribution: number;
  interestEarned: number;
  endBalance: number;
  withdrawal: number;
}

export interface ModelerResult {
  nestEggAtRetirement: number;
  monthlyRetirementIncome: number;
  annualRetirementIncome: number;
  totalEmployeeContributions: number;
  totalAgencyContributions: number;
  totalGrowth: number;
  incomeReplacementRatio: number;
  timeline: YearProjection[];
}

export function calculateRetirementModeler(inputs: RetirementModelerInputs): ModelerResult {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentBalance,
    annualSalary,
    employeeContributionPercent,
    agencyMatchPercent,
    salaryGrowthRate,
    preRetirementReturnRate,
    postRetirementReturnRate,
  } = inputs;

  const timeline: YearProjection[] = [];
  let balance = currentBalance;
  let salary = annualSalary;
  let totalEmployee = 0;
  let totalAgency = 0;
  let totalGrowth = 0;
  const currentYear = new Date().getFullYear();

  // Accumulation Phase
  for (let age = currentAge; age < retirementAge; age++) {
    const yr = currentYear + (age - currentAge);
    const empContrib = (salary * (employeeContributionPercent / 100));
    const agnContrib = (salary * (agencyMatchPercent / 100));
    const totalYearContrib = empContrib + agnContrib;
    
    totalEmployee += empContrib;
    totalAgency += agnContrib;

    const interest = (balance + totalYearContrib / 2) * (preRetirementReturnRate / 100);
    totalGrowth += interest;
    balance = balance + totalYearContrib + interest;

    timeline.push({
      age,
      year: yr,
      salary,
      employeeContribution: empContrib,
      agencyContribution: agnContrib,
      totalContribution: totalYearContrib,
      interestEarned: interest,
      endBalance: balance,
      withdrawal: 0
    });

    salary = salary * (1 + salaryGrowthRate / 100);
  }

  const nestEggAtRetirement = balance;
  const finalWorkingSalary = salary;

  // Decumulation Phase (Annuity formula over retirement years)
  const retirementYears = Math.max(1, lifeExpectancy - retirementAge);
  const r = postRetirementReturnRate / 100;
  let annualWithdrawal = 0;

  if (r > 0) {
    // PMT formula: P * (r / (1 - (1+r)^-n))
    annualWithdrawal = nestEggAtRetirement * (r / (1 - Math.pow(1 + r, -retirementYears)));
  } else {
    annualWithdrawal = nestEggAtRetirement / retirementYears;
  }

  const monthlyRetirementIncome = annualWithdrawal / 12;
  const incomeReplacementRatio = (annualWithdrawal / finalWorkingSalary) * 100;

  // Simulate Decumulation in Timeline
  let decumBalance = nestEggAtRetirement;
  for (let age = retirementAge; age <= lifeExpectancy; age++) {
    const yr = currentYear + (age - currentAge);
    const interest = decumBalance * (postRetirementReturnRate / 100);
    decumBalance = Math.max(0, decumBalance + interest - annualWithdrawal);

    timeline.push({
      age,
      year: yr,
      salary: 0,
      employeeContribution: 0,
      agencyContribution: 0,
      totalContribution: 0,
      interestEarned: interest,
      endBalance: decumBalance,
      withdrawal: annualWithdrawal
    });
  }

  return {
    nestEggAtRetirement,
    monthlyRetirementIncome,
    annualRetirementIncome: annualWithdrawal,
    totalEmployeeContributions: totalEmployee,
    totalAgencyContributions: totalAgency,
    totalGrowth,
    incomeReplacementRatio,
    timeline
  };
}

export interface ContributionLimitResult {
  regularLimit: number;
  catchUpLimit: number;
  totalAllowedLimit: number;
  eligibleCatchUpType: 'None' | 'Standard (Age 50+)' | 'Higher (Age 60-63 SECURE 2.0)';
  recommendedPerPayPeriod: number;
  projectedTotalAnnual: number;
  agencyMatchPreserved: boolean;
  notes: string;
}

export function calculateContributionLimit(
  age: number,
  payPeriodsPerYear: number = 26,
  desiredAnnualContribution: number = 23500
): ContributionLimitResult {
  const regularLimit = 23500;
  let catchUpLimit = 0;
  let catchUpType: 'None' | 'Standard (Age 50+)' | 'Higher (Age 60-63 SECURE 2.0)' = 'None';

  if (age >= 60 && age <= 63) {
    catchUpLimit = 11250;
    catchUpType = 'Higher (Age 60-63 SECURE 2.0)';
  } else if (age >= 50) {
    catchUpLimit = 7500;
    catchUpType = 'Standard (Age 50+)';
  }

  const totalAllowedLimit = regularLimit + catchUpLimit;
  const effectiveAnnual = Math.min(desiredAnnualContribution, totalAllowedLimit);
  const recommendedPerPayPeriod = Math.floor((effectiveAnnual / payPeriodsPerYear) * 100) / 100;
  const projectedTotalAnnual = recommendedPerPayPeriod * payPeriodsPerYear;

  const agencyMatchPreserved = effectiveAnnual >= (5000); // at least 5% preserved across 26 pay periods

  return {
    regularLimit,
    catchUpLimit,
    totalAllowedLimit,
    eligibleCatchUpType: catchUpType,
    recommendedPerPayPeriod,
    projectedTotalAnnual,
    agencyMatchPreserved,
    notes: `Spreading $${recommendedPerPayPeriod.toFixed(2)} across all ${payPeriodsPerYear} pay periods guarantees you receive the full 5% agency match on every single paycheck without capping out early.`
  };
}

export interface AnnuityEstimateResult {
  monthlyPayment: number;
  annualPayment: number;
  payoutOption: string;
  hasSpouseSurvivorBenefit: boolean;
  survivorMonthlyPayment: number;
}

export function calculateAnnuityEstimate(
  annuityBalance: number,
  age: number,
  option: 'single_level' | 'single_increasing' | 'joint_100_level' | 'joint_50_level' | 'single_10yr_certain',
  spouseAge: number = 62
): AnnuityEstimateResult {
  // Approximate federal life annuity actuarial rates
  let baseFactor = 0.0055 + (age - 60) * 0.00025; // baseline monthly factor
  let survivorMonthly = 0;
  let hasSpouse = false;
  let payoutOption = 'Single Life with Level Payments';

  if (option === 'single_level') {
    baseFactor = baseFactor * 1.0;
    payoutOption = 'Single Life with Level Payments';
  } else if (option === 'single_increasing') {
    baseFactor = baseFactor * 0.78; // lower initial payout for 2% annual inflation increase
    payoutOption = 'Single Life with 2% Annual Inflation Increase';
  } else if (option === 'joint_100_level') {
    baseFactor = baseFactor * 0.85;
    hasSpouse = true;
    payoutOption = 'Joint Life (100% Survivor Annuity) with Level Payments';
  } else if (option === 'joint_50_level') {
    baseFactor = baseFactor * 0.92;
    hasSpouse = true;
    payoutOption = 'Joint Life (50% Survivor Annuity) with Level Payments';
  } else if (option === 'single_10yr_certain') {
    baseFactor = baseFactor * 0.96;
    payoutOption = 'Single Life with 10-Year Certain Feature';
  }

  const monthlyPayment = annuityBalance * baseFactor;
  const annualPayment = monthlyPayment * 12;

  if (option === 'joint_100_level') {
    survivorMonthly = monthlyPayment;
  } else if (option === 'joint_50_level') {
    survivorMonthly = monthlyPayment * 0.5;
  }

  return {
    monthlyPayment,
    annualPayment,
    payoutOption,
    hasSpouseSurvivorBenefit: hasSpouse,
    survivorMonthlyPayment: survivorMonthly
  };
}

export interface RothConversionResult {
  conversionAmount: number;
  currentEstimatedTax: number;
  futureProjectedValueTraditional: number;
  futureProjectedValueRoth: number;
  futureEstimatedTaxAtRetirement: number;
  netFutureRothAdvantage: number;
}

export function calculateRothConversion(
  conversionAmount: number,
  federalTaxRatePercent: number, // e.g. 24
  stateTaxRatePercent: number, // e.g. 5
  yearsUntilRetirement: number, // e.g. 15
  annualGrowthRatePercent: number, // e.g. 7
  futureTaxRatePercent: number // e.g. 22
): RothConversionResult {
  const combinedTaxRate = (federalTaxRatePercent + stateTaxRatePercent) / 100;
  const currentEstimatedTax = conversionAmount * combinedTaxRate;

  const growthFactor = Math.pow(1 + annualGrowthRatePercent / 100, yearsUntilRetirement);
  const futureProjectedValueRoth = conversionAmount * growthFactor; // 100% tax-free!

  // If left in traditional:
  const futureProjectedValueTraditional = conversionAmount * growthFactor;
  const futureEstimatedTaxAtRetirement = futureProjectedValueTraditional * (futureTaxRatePercent / 100);
  const netTraditionalAfterTax = futureProjectedValueTraditional - futureEstimatedTaxAtRetirement;

  const netFutureRothAdvantage = futureProjectedValueRoth - netTraditionalAfterTax - currentEstimatedTax;

  return {
    conversionAmount,
    currentEstimatedTax,
    futureProjectedValueTraditional,
    futureProjectedValueRoth,
    futureEstimatedTaxAtRetirement,
    netFutureRothAdvantage
  };
}

export interface FederalBallparkResult {
  fersBasicAnnuityMonthly: number;
  socialSecurityMonthly: number;
  tspMonthlyDrawdown: number;
  totalMonthlyRetirementIncome: number;
  totalAnnualRetirementIncome: number;
  replacementRatio: number;
}

export function calculateFederalBallpark(
  high3Salary: number,
  yearsOfService: number,
  retirementAge: number,
  socialSecurityEstimate: number,
  tspProjectedBalance: number
): FederalBallparkResult {
  // FERS formula: If age 62+ with 20+ years of service: 1.1% factor. Otherwise 1.0% factor.
  const multiplier = (retirementAge >= 62 && yearsOfService >= 20) ? 0.011 : 0.010;
  const annualFers = high3Salary * yearsOfService * multiplier;
  const fersBasicAnnuityMonthly = annualFers / 12;

  // Sustainable 4% Rule for TSP
  const tspAnnualDrawdown = tspProjectedBalance * 0.04;
  const tspMonthlyDrawdown = tspAnnualDrawdown / 12;

  const totalMonthlyRetirementIncome = fersBasicAnnuityMonthly + socialSecurityEstimate + tspMonthlyDrawdown;
  const totalAnnualRetirementIncome = totalMonthlyRetirementIncome * 12;
  const replacementRatio = (totalAnnualRetirementIncome / high3Salary) * 100;

  return {
    fersBasicAnnuityMonthly,
    socialSecurityMonthly: socialSecurityEstimate,
    tspMonthlyDrawdown,
    totalMonthlyRetirementIncome,
    totalAnnualRetirementIncome,
    replacementRatio
  };
}
