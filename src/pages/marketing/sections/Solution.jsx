import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { ArchiveIcon, MixIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'

const pillars = [
  {
    title: 'Capture',
    desc: 'Collect decisions where they happen—without adding process overhead.',
    icon: ArchiveIcon,
    tone: 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200',
  },
  {
    title: 'Structure',
    desc: 'Turn messy discussions into clear records: context, alternatives, risks, and outcomes.',
    icon: MixIcon,
    tone: 'bg-indigo-500/10 text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-200',
  },
  {
    title: 'Retrieve',
    desc: 'Search “Why did we…?” and get evidence-linked answers in seconds.',
    icon: MagnifyingGlassIcon,
    tone: 'bg-cyan-500/10 text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-200',
  },
]

export function Solution() {
  return (
    <section className="pt-16 md:pt-24">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Decision history, built like an engineering system
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-white/70 md:text-base">
                DecisionVault is the evidence-first decision log your team actually uses—because it lives inside your
                workflow.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pillars.map((p, idx) => (
            <Reveal key={p.title} delay={0.05 * idx}>
              <div className="group flex h-full flex-col rounded-2xl border border-zinc-200/70 bg-gradient-to-b from-zinc-900/5 to-zinc-900/0 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:from-white/10 dark:to-white/5">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${p.tone}`}>
                    <p.icon width="18" height="18" />
                  </span>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">{p.title}</div>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-white/70">{p.desc}</div>
                <div className="flex-1" />
                <div className="mt-4 h-px w-full bg-zinc-200/70 dark:bg-white/10" />
                <div className="mt-4 text-xs text-zinc-500 dark:text-white/55">
                  Designed for audits, onboarding, retros, and incident reviews.
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
