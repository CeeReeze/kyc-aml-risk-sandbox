export type RiskLevel = "low" | "medium" | "high";
export type OnboardingChannel = "in-person" | "online" | "third-party";
export type IncomeBand = "low" | "middle" | "high";

export interface RiskProfile {
  age: number;
  countryRisk: RiskLevel;
  pep: boolean;
  sanctionsMatch: boolean;
  incomeBand: IncomeBand;
  occupationRisk: RiskLevel;
  onboardingChannel: OnboardingChannel;
  amount: number;
  velocity24h: number;
  crossBorder: boolean;
  cashIntensity: RiskLevel;
  counterpartyRisk: RiskLevel;
}

export interface RiskDriver {
  key: string;
  label: string;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface ScoreResult {
  score: number;
  band: RiskLevel;
  drivers: RiskDriver[];
}
