import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Trophy, Zap } from 'lucide-react'
import { Card, ProgressBar, SectionHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import { ACHIEVEMENTS } from '../lib/achievements'
import { levelForXP } from '../lib/scoring'
import { formatDate } from '../lib/utils'
import { cn } from '../lib/utils'
import { achKeys, LEVEL_TITLE_KEYS } from '../i18n'
import { useI18n } from '../i18n/useI18n'

export default function Achievements() {
  const { data } = useApp()
  const { t, lang } = useI18n()
  const lvl = levelForXP(data.profile.xp)

  const items = useMemo(
    () =>
      ACHIEVEMENTS.map((a) => {
        const unlockedAt = data.unlocked[a.id]
        const progress = Math.min(a.target, a.progress(data))
        return { ...a, unlockedAt, progress, pct: Math.round((progress / a.target) * 100) }
      }),
    [data],
  )

  const unlockedCount = items.filter((i) => i.unlockedAt).length
  const totalBonus = items.filter((i) => i.unlockedAt).reduce((s, i) => s + i.xp, 0)

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t('achPage.title')}
        subtitle={t('achPage.subtitle')}
      />

      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/10 text-amber-500">
            <Trophy className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {t('achPage.unlockedOf', { unlocked: unlockedCount, total: items.length })}
            </p>
            <p className="text-xs text-muted">
              {t('achPage.levelLine', { level: lvl.info.level, title: t(LEVEL_TITLE_KEYS[lvl.info.level - 1]) })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-indigo-500/[0.07] px-3.5 py-2 dark:bg-indigo-400/10">
          <Zap className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">
            {t('achPage.xpFrom', { xp: totalBonus })}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((a, i) => {
          const Icon = a.icon
          const unlocked = !!a.unlockedAt
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Card
                className={cn(
                  'relative h-full overflow-hidden p-5 transition',
                  unlocked
                    ? 'border-amber-300/50 bg-gradient-to-br from-amber-400/[0.06] to-orange-400/[0.03] dark:border-amber-400/25 dark:from-amber-400/[0.08] dark:to-orange-400/[0.04]'
                    : 'opacity-90',
                )}
              >
                {unlocked && (
                  <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <div className="flex items-start gap-3.5">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      unlocked
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/40'
                        : 'bg-slate-100 text-slate-400 dark:bg-white/[0.05] dark:text-slate-500',
                    )}
                  >
                    {unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4.5 w-4.5" />}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      {t(achKeys(a.id).title)}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{t(achKeys(a.id).desc)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  {unlocked ? (
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                      {t('achPage.unlocked', { date: formatDate(a.unlockedAt!, lang), xp: a.xp })}
                    </p>
                  ) : (
                    <>
                      <ProgressBar value={a.pct} barClass={a.pct > 60 ? undefined : 'from-slate-400 to-slate-500'} />
                      <p className="mt-1.5 text-[11px] font-medium text-muted">
                        {t('achPage.progress', { progress: a.progress, target: a.target, xp: a.xp })}
                      </p>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
