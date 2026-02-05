import { describe, expect, it } from "vitest";
import { calculateRiskScore } from "./risk";
import type { RiskProfile } from "./types";

const baseProfile: RiskProfile = {
  age: 35,
  countryRisk: "low",
  pep: false,
  sanctionsMatch: false,
  incomeBand: "middle",
  occupationRisk: "low",
  onboardingChannel: "in-person",
  amount: 1200,
  velocity24h: 1,
  crossBorder: false,
  cashIntensity: "low",
  counterpartyRisk: "low"
};

describe("calculateRiskScore", () => {
  it("returns low risk for a calm baseline", () => {
    const result = calculateRiskScore(baseProfile);
    expect(result.score).toBeLessThan(30);
    expect(result.band).toBe("low");
  });

  it("elevates score for sanctions matches", () => {
    const result = calculateRiskScore({ ...baseProfile, sanctionsMatch: true });
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.band).not.toBe("low");
  });

  it("orders drivers by contribution", () => {
    const result = calculateRiskScore({
      ...baseProfile,
      sanctionsMatch: true,
      pep: true,
      countryRisk: "high"
    });
    expect(result.drivers.length).toBeGreaterThan(0);
    result.drivers.forEach((driver, index, arr) => {
      if (index === 0) return;
      const previous = arr[index - 1];
      if (!previous) throw new Error("Missing previous driver");
      expect(previous.contribution).toBeGreaterThanOrEqual(driver.contribution);
    });
  });
});
