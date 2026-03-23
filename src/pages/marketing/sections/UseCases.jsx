import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { PersonIcon, ReaderIcon, LightningBoltIcon, BarChartIcon } from '@radix-ui/react-icons'

const cases = [
  {
    title: 'Onboarding',
    desc: 'New engineers get the “why” behind architecture in minutes, with evidence and versions.',
    icon: PersonIcon,
    tone: 'bg-cyan-500/10 text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-200',
    example: '“Why did we choose Postgres?”',
    outcome: 'Cuts ramp time and reduces repeat debates.',
  },
  {
    title: 'Retrospectives',
    desc: 'Review decisions with context and alternatives, then intentionally publish updated versions.',
    icon: BarChartIcon,
    tone: 'bg-indigo-500/10 text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-200',
    example: '“Which trade-offs changed since v1?”',
    outcome: 'Turns retro notes into durable decisions.',
  },
  {
    title: 'Incidents',
    desc: 'Link mitigations back to original constraints so fixes address root causes, not symptoms.',
    icon: LightningBoltIcon,
    tone: 'bg-fuchsia-500/10 text-fuchsia-800 dark:bg-fuchsia-400/10 dark:text-fuchsia-200',
    example: '“Why did we defer rate limiting?”',
    outcome: 'Faster incident learning and fewer repeats.',
  },
  {
    title: 'Leadership & Audits',
    desc: 'Produce evidence-backed reasoning when stakeholders ask how choices were made and approved.',
    icon: ReaderIcon,
    tone: 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200',
    example: '“Show decision history for RBAC scope.”',
    outcome: 'Clear accountability without archaeology.',
  },
]

export function UseCases() {
  return (
    <section className="pt-16 md:pt-24">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Use Cases</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-white/70 md:text-base">
                The most common moments teams need decision context. These flows are where DecisionVault earns trust.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {cases.map((c, idx) => (
            <Reveal key={c.title} delay={idx * 0.06}>
              <div className="group flex h-full flex-col rounded-2xl border border-zinc-200/70 bg-gradient-to-b from-zinc-900/5 to-zinc-900/0 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:from-white/10 dark:to-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${c.tone}`}>
                      <c.icon width="18" height="18" />
                    </span>
                    <div className="text-base font-semibold text-zinc-900 dark:text-white">{c.title}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-white/70">{c.desc}</div>
                <div className="mt-4 rounded-xl border border-zinc-200/70 bg-white/70 p-4 text-sm text-zinc-700 dark:border-white/10 dark:bg-black/20 dark:text-white/75">
                  <div className="text-[11px] font-semibold text-zinc-500 dark:text-white/55">Example query</div>
                  <div className="mt-1 font-medium">{c.example}</div>
                </div>
                <div className="flex-1" />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-500 dark:text-white/55">{c.outcome}</div>
                  <div className="inline-flex items-center rounded-full bg-zinc-900/5 px-3 py-1 text-[11px] text-zinc-600 dark:bg-white/10 dark:text-white/65">
                    Evidence linked
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
