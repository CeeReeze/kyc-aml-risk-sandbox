# KYC/AML Risk Sandbox

A transparent, client-only demo that lets you tweak synthetic KYC/AML signals and see a live risk score with clear explanations. This project is meant to be shared on a personal website or GitHub to showcase compliance + data + frontend skills.

## Why it exists

Compliance work is often invisible. This demo makes risk scoring tangible and shows how multiple signals can combine into a single, explainable score.

## Features

- Synthetic profile generator (no real PII)
- Live risk score (0-100) with banding
- Top driver explanations
- Clean, shareable UI

## Tech Stack

- React + Vite + TypeScript
- Vitest for unit tests

## Local Development

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

This app is static and deploys cleanly to Vercel. Build output is in `dist`.

## Disclaimer

All profiles and data are synthetic. The scoring logic is illustrative only and should not be used for real compliance decisions.

## License

MIT
