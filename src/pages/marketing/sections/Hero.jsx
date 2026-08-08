import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { Button } from '../components/Button'
import { Reveal } from '../components/Reveal'

export function Hero() {
  return (
    <section className="relative pt-16 md:pt-20">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-2 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300/80" />
                Built for product teams shipping fast
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                Never ask <span className="text-zinc-700 dark:text-white/70">‘Why did we build this?’</span> again.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-zinc-600 dark:text-white/70 md:text-lg">
                Capture, structure, and search every product decision automatically. Turn Slack threads, docs, and
                meeting notes into evidence-linked decision history your team can trust.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link to="/signup">Book Demo</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-zinc-500 dark:text-white/55">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300/80" />
                  Evidence-first answers
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300/80" />
                  Versioned decision records
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300/80" />
                  Multi-tenant by design
                </div>
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-5">
            <motion.div
              className="relative rounded-[28px] border border-zinc-200/70 bg-gradient-to-b from-zinc-900/5 to-zinc-900/0 p-5 shadow-soft dark:border-white/10 dark:from-white/10 dark:to-white/5"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="rounded-2xl border border-zinc-200/70 bg-white/75 p-4 dark:border-white/10 dark:bg-black/30">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-zinc-700 dark:text-white/70">Kavi AI</div>
                  <div className="rounded-full bg-blue-500/10 px-2 py-1 text-[11px] text-blue-700 dark:text-blue-200">
                    Live capture
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-zinc-200/70 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="text-[11px] text-zinc-500 dark:text-white/60">From Slack</div>
                    <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                      “We’ll ship RBAC in Stage 1 and defer SSO.”
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-white/50">
                      <span className="rounded bg-zinc-900/5 px-2 py-1 dark:bg-white/10">Evidence</span>
                      <span className="rounded bg-zinc-900/5 px-2 py-1 dark:bg-white/10">Alternatives</span>
                      <span className="rounded bg-zinc-900/5 px-2 py-1 dark:bg-white/10">Risks</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-200/70 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="text-[11px] text-zinc-500 dark:text-white/60">Search</div>
                    <div className="mt-2 rounded-lg bg-zinc-900/5 px-3 py-2 text-[12px] text-zinc-700 dark:bg-black/40 dark:text-white/70">
                      Why did we choose PostgreSQL?
                    </div>
                    <div className="mt-2 text-[11px] text-zinc-500 dark:text-white/55">
                      Answered with decision v3 • 2 evidence links
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full bg-blue-400/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-blue-400/20 blur-2xl" />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  )
}
