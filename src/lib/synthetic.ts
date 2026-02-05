import type { IncomeBand, OnboardingChannel, RiskLevel, RiskProfile } from "./types";

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T>(items: T[], rng: () => number): T => {
  const index = Math.floor(rng() * items.length);
  return items[index] ?? items[0];
};

const chance = (probability: number, rng: () => number) => rng() < probability;

export const generateSyntheticProfile = (seed = Date.now()): RiskProfile => {
  const rng = mulberry32(seed);

  const riskLevels: RiskLevel[] = ["low", "medium", "high"];
  const incomeBands: IncomeBand[] = ["low", "middle", "high"];
  const onboarding: OnboardingChannel[] = ["in-person", "online", "third-party"];

  const incomeBand = pick(incomeBands, rng);
  const baseAmount = incomeBand === "low" ? 800 : incomeBand === "middle" ? 2500 : 6000;

  return {
    age: Math.floor(18 + rng() * 60),
    countryRisk: pick(riskLevels, rng),
    pep: chance(0.07, rng),
    sanctionsMatch: chance(0.02, rng),
    incomeBand,
    occupationRisk: pick(riskLevels, rng),
    onboardingChannel: pick(onboarding, rng),
    amount: Math.round(baseAmount + rng() * 12000),
    velocity24h: Math.floor(rng() * 12),
    crossBorder: chance(0.35, rng),
    cashIntensity: pick(riskLevels, rng),
    counterpartyRisk: pick(riskLevels, rng)
  };
};
