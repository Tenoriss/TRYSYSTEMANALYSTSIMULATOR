import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Lightbulb, Radar, SearchCheck, Wrench } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button } from '../components/ui'

const WORDS = ['Investigate.', 'Analyze.', 'Design.', 'Solve.']

const SLIDES = [
  {
    icon: Radar,
    title: 'Welcome to System Analyst Simulator.',
    body: 'Step into the role of a system analyst. Take messy, real-world business situations and turn them into structured, professional analysis.',
  },
  {
    icon: SearchCheck,
    title: 'Your mission is simple.',
    body: 'Take a real-world system problem and turn it into a structured solution: stakeholders, problems, requirements, models, solution design, risk analysis, and a final report.',
  },
  {
    icon: Wrench,
    title: 'Learn by doing, not by reading.',
    body: 'Interview stakeholders, map broken processes, write requirements, and get scored by a rule-based evaluator — just like a real engagement.',
  },
]

export default function Onboarding() {
  const { completeOnboarding } = useApp()
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)
  const [wordIdx, setWordIdx] = useState(0)
  const last = SLIDES.length - 1
  const Icon = SLIDES[slide].icon

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#05080f] px-6 py-12 text-slate-200">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <div className="mb-8 flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.28em] text-cyan-300">
          <Radar className="h-4 w-4" />
          SYSTEM ANALYST SIMULATOR
        </div>

        {/* Rotating verbs */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-display text-4xl font-bold sm:text-5xl">
          {WORDS.map((w, i) => (
            <button
              key={w}
              onClick={() => setWordIdx(i)}
              onMouseEnter={() => setWordIdx(i)}
              className={
                i === wordIdx
                  ? 'text-gradient transition-all duration-300'
                  : 'text-slate-600 transition-all duration-300 hover:text-slate-400'
              }
            >
              {w}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur sm:p-10"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-cyan-400/15 text-cyan-300">
              <Icon className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold text-white sm:text-3xl">{SLIDES[slide].title}</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
              {SLIDES[slide].body}
            </p>

            {slide === last && (
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                All progress is saved locally in your browser — no account needed.
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === slide ? 'w-8 bg-indigo-400' : 'w-2 bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          {slide < last ? (
            <Button size="lg" onClick={() => setSlide((s) => s + 1)} icon={ArrowRight}>
              Continue
            </Button>
          ) : (
            <Button
              size="lg"
              icon={ArrowRight}
              onClick={() => {
                completeOnboarding()
                navigate('/cases')
              }}
            >
              Start Your First Case
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
