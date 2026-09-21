/* Node smoke test for core logic — run: npx esbuild scripts/smoke.ts --bundle --platform=node --format=esm --outfile=.smoke.mjs && node .smoke.mjs */
import { computeEvaluation, evaluationGate, levelForXP, problemPriority, riskScore, applyStreak } from '../src/lib/scoring'
import { evaluateAchievements } from '../src/lib/achievements'
import type { AppData, CaseProgress } from '../src/types'

let failures = 0
function check(name: string, cond: boolean) {
  if (cond) console.log(`  ✓ ${name}`)
  else {
    failures++
    console.error(`  ✗ FAIL: ${name}`)
  }
}

function mkAnalysis(partial: Partial<CaseProgress>): CaseProgress {
  return {
    caseId: 'retail-inventory',
    status: 'in-progress',
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStep: 'investigation',
    stakeholders: [],
    interviews: [],
    problems: [],
    rootCauses: [],
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    useCases: [],
    processSteps: [],
    asIsToBe: { currentProcess: '', currentProblems: '', currentTools: '', bottlenecks: '', proposedProcess: '', newSystem: '', improvements: '', expectedBenefits: '' },
    solution: { name: '', description: '', targetUsers: '', technology: '', expectedBenefits: '', risks: '', limitations: '' },
    features: [],
    risks: [],
    ...partial,
  }
}

const iso = () => new Date().toISOString()

console.log('level & xp')
{
  check('0 XP → level 1 Junior Analyst', levelForXP(0).info.title === 'Junior Analyst' && levelForXP(0).info.level === 1)
  check('150 XP → level 2', levelForXP(150).info.level === 2)
  check('399 XP → level 2 still', levelForXP(399).info.level === 2)
  check('1500 XP → level 5 max', levelForXP(1500).info.level === 5 && levelForXP(1500).next === null)
  check('progress within level computed', levelForXP(75).progress === 50)
}

console.log('streak')
{
  const today = new Date()
  const key = (d: Date) => `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`
  const y = new Date(); y.setDate(y.getDate() - 1)
  check('same day keeps streak', applyStreak(key(today), 3) === 3)
  check('yesterday increments', applyStreak(key(y), 3) === 4)
  check('gap resets to 1', applyStreak('2020-01-01', 9) === 1)
  check('first activity → 1', applyStreak(null, 0) === 1)
}

console.log('priority & risk math')
{
  const p = { severity: 'Critical', frequency: 'Frequently' } as Parameters<typeof problemPriority>[0]
  check('Critical×Frequently = 12/Critical', problemPriority(p).score === 12 && problemPriority(p).label === 'Critical')
  const rLow = { probability: 'Low', impact: 'Low' } as Parameters<typeof riskScore>[0]
  const rMed = { probability: 'Medium', impact: 'Medium' } as Parameters<typeof riskScore>[0]
  const rHigh = { probability: 'High', impact: 'High' } as Parameters<typeof riskScore>[0]
  check('risk 1×1 → Low', riskScore(rLow).score === 1 && riskScore(rLow).label === 'Low')
  check('risk 2×2 → Medium', riskScore(rMed).score === 4 && riskScore(rMed).label === 'Medium')
  check('risk 3×3 → High', riskScore(rHigh).score === 9 && riskScore(rHigh).label === 'High')
}

console.log('evaluation gate & scoring')
{
  const empty = mkAnalysis({})
  check('empty analysis gate blocked', !evaluationGate(empty).ok)
  const ev0 = computeEvaluation(empty)
  check('empty analysis total = 0', ev0.total === 0)

  const full = mkAnalysis({
    stakeholders: [
      { id: '1', name: 'A', role: 'r', department: 'd', interest: 'High', influence: 'High', concern: '', createdAt: iso() },
      { id: '2', name: 'B', role: 'r', department: 'd', interest: 'Low', influence: 'High', concern: '', createdAt: iso() },
      { id: '3', name: 'C', role: 'r', department: 'd', interest: 'Medium', influence: 'Low', concern: '', createdAt: iso() },
    ],
    interviews: [
      { id: '1', stakeholder: 'A', question: 'q', answer: 'a', custom: false, createdAt: iso() },
      { id: '2', stakeholder: 'A', question: 'q2', answer: 'a', custom: false, createdAt: iso() },
      { id: '3', stakeholder: 'B', question: 'q3', answer: 'a', custom: true, createdAt: iso() },
    ],
    problems: [
      { id: '1', title: 'P1', description: 'x', rootCause: 'rc', impact: 'i', severity: 'High', frequency: 'Frequently', evidence: 'e', createdAt: iso() },
      { id: '2', title: 'P2', description: 'x', rootCause: 'rc', impact: 'i', severity: 'Low', frequency: 'Rarely', evidence: 'e', createdAt: iso() },
      { id: '3', title: 'P3', description: 'x', rootCause: 'rc', impact: 'i', severity: 'Critical', frequency: 'Constantly', evidence: 'e', createdAt: iso() },
    ],
    rootCauses: [{ id: '1', problem: 'P1', whys: ['a', 'b', 'c', 'd', 'e'], conclusion: 'c', createdAt: iso() }],
    functionalRequirements: Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`, code: `FR-00${i + 1}`, requirement: 'r', description: 'd', priority: 'Must Have' as const, source: 's', status: 'Approved' as const, createdAt: iso(),
    })),
    nonFunctionalRequirements: Array.from({ length: 3 }, (_, i) => ({
      id: `${i}`, code: `NFR-00${i + 1}`, requirement: 'r', category: 'Performance' as const, priority: 'Must Have' as const, description: 'd', createdAt: iso(),
    })),
    useCases: [
      { id: '1', actor: 'A', name: 'UC1', description: '', preconditions: '', mainFlow: '1. step', alternativeFlow: '', postconditions: '', createdAt: iso() },
      { id: '2', actor: 'A', name: 'UC2', description: '', preconditions: '', mainFlow: '1. step', alternativeFlow: '', postconditions: '', createdAt: iso() },
      { id: '3', actor: 'B', name: 'UC3', description: '', preconditions: '', mainFlow: '', alternativeFlow: '', postconditions: '', createdAt: iso() },
    ],
    processSteps: [
      { id: '1', type: 'start', label: 'Start', note: '' },
      { id: '2', type: 'process', label: 'Do A', note: '' },
      { id: '3', type: 'process', label: 'Do B', note: '' },
      { id: '4', type: 'decision', label: 'OK?', note: 'YES' },
      { id: '5', type: 'end', label: 'End', note: '' },
    ],
    asIsToBe: { currentProcess: 'x', currentProblems: 'x', currentTools: 'x', bottlenecks: 'x', proposedProcess: 'x', newSystem: 'x', improvements: 'x', expectedBenefits: 'x' },
    solution: { name: 'Sol', description: 'd', targetUsers: 't', technology: 'web', expectedBenefits: 'b', risks: 'r', limitations: 'l' },
    features: [
      { id: '1', name: 'F1', description: '', priority: 'High', userRole: 'A' },
      { id: '2', name: 'F2', description: '', priority: 'Medium', userRole: 'B' },
      { id: '3', name: 'F3', description: '', priority: 'Low', userRole: 'C' },
    ],
    risks: [
      { id: '1', risk: 'R1', probability: 'High', impact: 'High', mitigation: 'm', owner: 'o', createdAt: iso() },
      { id: '2', risk: 'R2', probability: 'Medium', impact: 'Low', mitigation: 'm', owner: 'o', createdAt: iso() },
      { id: '3', risk: 'R3', probability: 'Low', impact: 'Medium', mitigation: 'm', owner: 'o', createdAt: iso() },
    ],
  })
  check('full analysis gate open', evaluationGate(full).ok)
  const ev = computeEvaluation(full)
  check('investigation 20/20', ev.breakdown.investigation.score === 20)
  check('problems 20/20', ev.breakdown.problems.score === 20)
  check('requirements 20/20', ev.breakdown.requirements.score === 20)
  check('modeling 15/15', ev.breakdown.modeling.score === 15)
  check('solution 15/15', ev.breakdown.solution.score === 15)
  check('risk 10/10', ev.breakdown.risk.score === 10)
  check('perfect total 100', ev.total === 100)
  check('strengths exist', ev.strengths.length > 0)
}

console.log('achievements')
{
  const d: AppData = {
    analyses: { 'retail-inventory': mkAnalysis({ processSteps: Array.from({ length: 5 }, (_, i) => ({ id: `${i}`, type: 'process' as const, label: 'x', note: '' })) }) },
    profile: { xp: 2000, streak: 1, lastActivityDate: null, onboarded: true, createdAt: iso() },
    unlocked: {},
    settings: { theme: 'dark' },
  }
  const fresh = evaluateAchievements(d).map((a) => a.id)
  check('first-steps unlocked by starting a case', fresh.includes('first-steps'))
  check('process-mapper unlocked at 5 steps', fresh.includes('process-mapper'))
  check('senior-analyst unlocked at level 5', fresh.includes('senior-analyst'))
  check('problem-solver NOT unlocked (no completed cases)', !fresh.includes('problem-solver'))
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECKS FAILED`)
process.exit(failures === 0 ? 0 : 1)
