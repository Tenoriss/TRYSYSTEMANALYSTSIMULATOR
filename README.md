# System Analyst Simulator

An interactive, fully client-side simulator for practicing the craft of a **System Analyst**. Work through realistic case studies end-to-end — from stakeholder investigation to a printable professional report.

> Case → Investigation → Problem Analysis → Requirements → Modeling → Solution → Evaluation → Report

## Features

- **Bilingual UI (English & Indonesian)** — full English ↔ Bahasa Indonesia localization covering the interface, evaluator feedback, achievements, and the built-in case material. Switch from the top bar toggle or Settings → Language; English stays the default.
- **Local accounts: login, signup, roles & editable profiles** — sign up with name, email, password (hashed locally), and a role: Mahasiswa · Pelajar · Guru · Dosen · Prefer not to say · or *other* with a free-text "write your own role" field. Update your display name and role later in Settings; the sign-in email remains fixed. Every account gets isolated progress, achievements, analyses, and feedback notes via namespaced storage. Honest simulation: no server, no backend — accounts live only in this browser.
- **Admin / developer unlock** — reach the expert stage (Level 5 · Solution Architect) to earn case-authoring rights: add, edit, and delete custom case studies (industry incl. write-your-own, icon, difficulty, processes, problems, objectives, constraints, stakeholders, interview questions). Custom cases appear in the library with a Custom badge, are searchable, and are fully analyzable like the built-ins.
- **Case Library** — 6 built-in scenarios across Retail, Education, Healthcare, Restaurant, Logistics, and Finance, each with its own organization, processes, stakeholders, problems, objectives, and constraints.
- **Guided analysis workflow** — a 7-step stepper (Investigation → Problems → Requirements → Modeling → Solution → Evaluation → Report) with autosave and per-phase progress.
- **Analysis methods knowledge base** — a searchable, bilingual field guide with practical, stage-filtered playbooks for stakeholder mapping, interviews, SIPOC, root-cause analysis, requirements prioritization, modeling, risk, and evaluation.
- **Dashboard feedback form** — collect a rating and categorized note; feedback is stored per account in this browser and is never sent to a server.
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
├── context/           # AppContext (state + per-account persistence + XP), AuthContext (local login/signup) & ToastContext
├── data/              # cases.ts (6 built-in scenarios), customCases.ts, analysisMethods.ts
├── lib/               # storage.ts, accounts.ts, feedback.ts, crypto.ts, scoring.ts, achievements.ts, utils.ts
├── pages/             # Dashboard, Cases, Methods, CaseDetail, Login, SignUp, MyAnalyses, Reports, Achievements, Settings…
│   └── admin/         # CaseForm (authoring)
│   └── analysis/      # Investigation, Problems, Requirements, Modeling, Solution, Evaluation, Report
├── types/             # Typed interfaces for every domain entity
└── App.tsx            # Routes (lazy-loaded) & providers
```

All user data lives in `localStorage` under the `sas.*` keys and survives refresh: accounts (`sas.accounts.v1`), the session, custom cases (`sas.customCases.v1`), per-account progress and feedback (`.u.<accountId>` suffix on the data keys). Nothing is sent to a server.

## Deploy

Static SPA — deploy `dist/` to Vercel/Netlify/GitHub Pages. `vercel.json` already includes the SPA rewrite.
