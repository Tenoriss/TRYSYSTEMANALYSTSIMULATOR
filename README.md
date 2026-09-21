# System Analyst Simulator

An interactive, fully client-side simulator for practicing the craft of a **System Analyst**. Work through realistic case studies end-to-end — from stakeholder investigation to a printable professional report.

> Case → Investigation → Problem Analysis → Requirements → Modeling → Solution → Evaluation → Report

## Features

- **Case Library** — 6 built-in scenarios across Retail, Education, Healthcare, Restaurant, Logistics, and Finance, each with its own organization, processes, stakeholders, problems, objectives, and constraints.
- **Guided analysis workflow** — a 7-step stepper (Investigation → Problems → Requirements → Modeling → Solution → Evaluation → Report) with autosave and per-phase progress.
- **Investigation tools** — stakeholder register with Interest × Influence matrix, and an interview simulation with case-specific questions and custom Q&A.
- **Problem analysis** — severity/frequency-based priority scoring and a dedicated **5 Whys** root cause board.
- **Requirements engineering** — functional (MoSCoW + status) and non-functional (6 quality categories) requirement tables with search & filter and auto-generated IDs.
- **Modeling** — use case builder with auto-generated SVG diagram, a step-based process flow builder (start / process / decision / end with reordering), and an AS-IS vs TO-BE workspace.
- **Solution design** — solution brief, prioritized feature list, and a risk register with automatic probability × impact scoring and a risk matrix.
- **Rule-based evaluation** — transparent scoring out of 100 with per-area breakdown and data-driven strengths / improvement feedback. No AI, no external APIs.
- **Gamification** — XP for real analysis work, 5 analyst levels (Junior Analyst → Solution Architect), streaks, and 11 unlockable achievements.
- **Professional report** — a 15-section printable report (Print / Save as PDF via the browser).
- **Everything else you expect** — global search (⌘K / Ctrl+K), dark/light/system theme, JSON export & import, clear-data with confirmation, onboarding, toasts, empty states, and full responsiveness.

## Tech Stack

React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · Framer Motion · Lucide Icons · LocalStorage (no backend)

## Getting Started

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Verify core logic (levels, streaks, scoring, achievements):

```bash
npx esbuild scripts/smoke.ts --bundle --platform=node --format=esm --outfile=.smoke.mjs && node .smoke.mjs && rm .smoke.mjs
```

## Project Structure

```
src/
├── components/        # Layout (sidebar/topbar/bottom nav), SearchPalette, Modal, UI primitives
├── context/           # AppContext (state + LocalStorage persistence + XP) & ToastContext
├── data/cases.ts      # 6 built-in case scenarios
├── lib/               # storage.ts, scoring.ts, achievements.ts, utils.ts
├── pages/             # Dashboard, Cases, CaseDetail, MyAnalyses, Reports, Achievements, Settings…
│   └── analysis/      # Investigation, Problems, Requirements, Modeling, Solution, Evaluation, Report
├── types/             # Typed interfaces for every domain entity
└── App.tsx            # Routes (lazy-loaded) & providers
```

All user data lives in `localStorage` under the `sas.*` keys and survives refresh. Nothing is sent to a server.

## Deploy

Static SPA — deploy `dist/` to Vercel/Netlify/GitHub Pages. `vercel.json` already includes the SPA rewrite.
