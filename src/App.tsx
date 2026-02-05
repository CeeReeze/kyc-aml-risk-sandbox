import { useEffect, useMemo, useRef, useState } from "react";
import { calculateRiskScore } from "./lib/risk";
import { generateSyntheticProfile } from "./lib/synthetic";
import type { IncomeBand, OnboardingChannel, RiskLevel, RiskProfile } from "./lib/types";

const DEFAULT_PROFILE: RiskProfile = {
  age: 34,
  countryRisk: "medium",
  pep: false,
  sanctionsMatch: false,
  incomeBand: "middle",
  occupationRisk: "low",
  onboardingChannel: "online",
  amount: 4200,
  velocity24h: 2,
  crossBorder: false,
  cashIntensity: "medium",
  counterpartyRisk: "medium"
};

const riskOptions: { label: string; value: RiskLevel }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" }
];

const incomeOptions: { label: string; value: IncomeBand }[] = [
  { label: "Low", value: "low" },
  { label: "Middle", value: "middle" },
  { label: "High", value: "high" }
];

const onboardingOptions: { label: string; value: OnboardingChannel }[] = [
  { label: "In-person", value: "in-person" },
  { label: "Online", value: "online" },
  { label: "Third-party", value: "third-party" }
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

const useAnimatedNumber = (value: number, duration = 250) => {
  const [display, setDisplay] = useState(value);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    let rafId = 0;
    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const next = Math.round(from + (to - from) * progress);
      setDisplay(next);
      if (progress < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
  }, [value]);

  return display;
};

const bandLabel = (band: RiskLevel) =>
  band === "low" ? "Low" : band === "medium" ? "Medium" : "High";

function App() {
  const [profile, setProfile] = useState<RiskProfile>(DEFAULT_PROFILE);
  const result = useMemo(() => calculateRiskScore(profile), [profile]);
  const animatedScore = useAnimatedNumber(result.score);

  const updateProfile = <K extends keyof RiskProfile>(key: K, value: RiskProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Synthetic Data Demo</p>
          <h1>KYC/AML Risk Sandbox</h1>
          <p className="subtitle">
            Adjust customer and transaction signals to see a transparent AML risk score
            update in real time. All data is synthetic and for demonstration only.
          </p>
        </div>
        <div className="hero-card">
          <p className="hero-card-title">Risk Score</p>
          <div className={`score score-${result.band}`}>
            <span className="score-number">{animatedScore}</span>
            <span className="score-max">/ 100</span>
          </div>
          <p className={`score-band score-${result.band}`}>
            {bandLabel(result.band)} Risk
          </p>
          <p className="score-note">Top contributing factors below.</p>
        </div>
      </header>

      <main className="grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Customer Profile</h2>
            <div className="panel-actions">
              <button
                className="btn ghost"
                onClick={() => setProfile(DEFAULT_PROFILE)}
              >
                Reset
              </button>
              <button
                className="btn"
                onClick={() => setProfile(generateSyntheticProfile())}
              >
                Randomize
              </button>
            </div>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Age</span>
              <input
                type="number"
                min={18}
                max={90}
                value={profile.age}
                onChange={(event) =>
                  updateProfile("age", Math.max(18, Number(event.target.value)))
                }
              />
            </label>

            <label className="field">
              <span>Country risk</span>
              <select
                value={profile.countryRisk}
                onChange={(event) =>
                  updateProfile("countryRisk", event.target.value as RiskLevel)
                }
              >
                {riskOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Occupation risk</span>
              <select
                value={profile.occupationRisk}
                onChange={(event) =>
                  updateProfile("occupationRisk", event.target.value as RiskLevel)
                }
              >
                {riskOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Income band</span>
              <select
                value={profile.incomeBand}
                onChange={(event) =>
                  updateProfile("incomeBand", event.target.value as IncomeBand)
                }
              >
                {incomeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Onboarding channel</span>
              <select
                value={profile.onboardingChannel}
                onChange={(event) =>
                  updateProfile(
                    "onboardingChannel",
                    event.target.value as OnboardingChannel
                  )
                }
              >
                {onboardingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="toggle">
              <input
                type="checkbox"
                checked={profile.pep}
                onChange={(event) => updateProfile("pep", event.target.checked)}
              />
              <span>PEP flag</span>
            </label>

            <label className="toggle">
              <input
                type="checkbox"
                checked={profile.sanctionsMatch}
                onChange={(event) =>
                  updateProfile("sanctionsMatch", event.target.checked)
                }
              />
              <span>Potential sanctions match</span>
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Transaction Signals</h2>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Amount ({formatCurrency(profile.amount)})</span>
              <input
                type="range"
                min={100}
                max={20000}
                step={100}
                value={profile.amount}
                onChange={(event) =>
                  updateProfile("amount", Number(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>Velocity (24h)</span>
              <input
                type="number"
                min={0}
                max={20}
                value={profile.velocity24h}
                onChange={(event) =>
                  updateProfile("velocity24h", Number(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>Cash intensity</span>
              <select
                value={profile.cashIntensity}
                onChange={(event) =>
                  updateProfile("cashIntensity", event.target.value as RiskLevel)
                }
              >
                {riskOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Counterparty risk</span>
              <select
                value={profile.counterpartyRisk}
                onChange={(event) =>
                  updateProfile("counterpartyRisk", event.target.value as RiskLevel)
                }
              >
                {riskOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="toggle">
              <input
                type="checkbox"
                checked={profile.crossBorder}
                onChange={(event) =>
                  updateProfile("crossBorder", event.target.checked)
                }
              />
              <span>Cross-border activity</span>
            </label>
          </div>
        </section>

        <section className="panel drivers">
          <div className="panel-header">
            <h2>Top Drivers</h2>
            <p className="panel-subtitle">
              The five strongest contributors based on the current settings.
            </p>
          </div>
          {result.drivers.length === 0 ? (
            <div className="empty-state">
              <p>No active risk signals yet. Increase a few factors to see drivers.</p>
            </div>
          ) : (
            <div className="driver-list">
              {result.drivers.map((driver) => (
                <article key={driver.key} className="driver-card">
                  <div>
                    <h3>{driver.label}</h3>
                    <p>{driver.explanation}</p>
                  </div>
                  <div className="driver-score">+{driver.contribution}</div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel how-it-works">
          <h2>How the score works</h2>
          <p>
            This sandbox uses a simple additive model with transparent weights for
            common KYC/AML risk signals. Higher weights are assigned to red flags
            like sanctions matches, PEP status, and high-risk jurisdictions.
          </p>
          <p>
            The total score is capped at 100 and mapped to a low, medium, or high
            band. The model is illustrative only and not intended for production use.
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>
          All profiles are synthetic. This is a conceptual demo to explain how
          risk scoring can be structured.
        </p>
        <p>
          Build by Celian Kouame. Add the repo link here once published.
        </p>
      </footer>
    </div>
  );
}

export default App;
