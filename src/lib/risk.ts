import type { RiskDriver, RiskLevel, RiskProfile, ScoreResult } from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const bandFromScore = (score: number): RiskLevel => {
  if (score >= 70) return "high";
  if (score >= 30) return "medium";
  return "low";
};

const levelWeight = (level: RiskLevel, medium: number, high: number) => {
  if (level === "high") return high;
  if (level === "medium") return medium;
  return 0;
};

export const calculateRiskScore = (profile: RiskProfile): ScoreResult => {
  const drivers: RiskDriver[] = [];

  if (profile.pep) {
    drivers.push({
      key: "pep",
      label: "PEP flag",
      weight: 20,
      contribution: 20,
      explanation: "Politically exposed persons require enhanced due diligence."
    });
  }

  if (profile.sanctionsMatch) {
    drivers.push({
      key: "sanctions",
      label: "Potential sanctions match",
      weight: 40,
      contribution: 40,
      explanation: "Potential sanctions matches dramatically elevate risk."
    });
  }

  const countryContribution = levelWeight(profile.countryRisk, 8, 15);
  if (countryContribution > 0) {
    drivers.push({
      key: "country",
      label: "Country risk",
      weight: 15,
      contribution: countryContribution,
      explanation: "Higher jurisdictional risk increases monitoring intensity."
    });
  }

  const occupationContribution = levelWeight(profile.occupationRisk, 4, 8);
  if (occupationContribution > 0) {
    drivers.push({
      key: "occupation",
      label: "Occupation risk",
      weight: 8,
      contribution: occupationContribution,
      explanation: "Certain industries have higher exposure to AML risk."
    });
  }

  if (profile.onboardingChannel === "online") {
    drivers.push({
      key: "onboarding-online",
      label: "Online onboarding",
      weight: 4,
      contribution: 4,
      explanation: "Remote onboarding can reduce identity assurance."
    });
  }

  if (profile.onboardingChannel === "third-party") {
    drivers.push({
      key: "onboarding-third-party",
      label: "Third-party onboarding",
      weight: 6,
      contribution: 6,
      explanation: "Third-party introductions can obscure source verification."
    });
  }

  let amountContribution = 0;
  if (profile.amount >= 10000) amountContribution = 12;
  else if (profile.amount >= 5000) amountContribution = 6;

  if (amountContribution > 0) {
    drivers.push({
      key: "amount",
      label: "High transaction amount",
      weight: 12,
      contribution: amountContribution,
      explanation: "Larger transfers demand more scrutiny for source of funds."
    });
  }

  let velocityContribution = 0;
  if (profile.velocity24h >= 10) velocityContribution = 10;
  else if (profile.velocity24h >= 5) velocityContribution = 5;

  if (velocityContribution > 0) {
    drivers.push({
      key: "velocity",
      label: "High transaction velocity",
      weight: 10,
      contribution: velocityContribution,
      explanation: "Rapid transaction bursts can signal layering behavior."
    });
  }

  if (profile.crossBorder) {
    drivers.push({
      key: "cross-border",
      label: "Cross-border activity",
      weight: 8,
      contribution: 8,
      explanation: "Cross-border flows elevate jurisdictional complexity."
    });
  }

  const cashContribution = levelWeight(profile.cashIntensity, 5, 10);
  if (cashContribution > 0) {
    drivers.push({
      key: "cash",
      label: "Cash intensity",
      weight: 10,
      contribution: cashContribution,
      explanation: "Cash-heavy activity is harder to trace and verify."
    });
  }

  const counterpartyContribution = levelWeight(profile.counterpartyRisk, 5, 10);
  if (counterpartyContribution > 0) {
    drivers.push({
      key: "counterparty",
      label: "Counterparty risk",
      weight: 10,
      contribution: counterpartyContribution,
      explanation: "Riskier counterparties increase the exposure surface."
    });
  }

  if (profile.incomeBand === "low" && profile.amount >= 5000) {
    drivers.push({
      key: "income-mismatch",
      label: "Income mismatch",
      weight: 8,
      contribution: 8,
      explanation: "Transaction size appears inconsistent with stated income."
    });
  }

  if (profile.incomeBand === "middle" && profile.amount >= 10000) {
    drivers.push({
      key: "income-mismatch",
      label: "Income mismatch",
      weight: 6,
      contribution: 6,
      explanation: "Transaction size may be high relative to income band."
    });
  }

  if (profile.age < 21) {
    drivers.push({
      key: "age-young",
      label: "Young customer",
      weight: 4,
      contribution: 4,
      explanation: "Young customers can have limited financial history."
    });
  }

  if (profile.age > 70) {
    drivers.push({
      key: "age-senior",
      label: "Senior customer",
      weight: 3,
      contribution: 3,
      explanation: "Senior customers can be more vulnerable to misuse."
    });
  }

  const rawScore = drivers.reduce((sum, driver) => sum + driver.contribution, 0);
  const score = clamp(Math.round(rawScore), 0, 100);
  const band = bandFromScore(score);
  const sorted = [...drivers].sort((a, b) => b.contribution - a.contribution);

  return {
    score,
    band,
    drivers: sorted.slice(0, 5)
  };
};
