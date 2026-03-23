import { motion } from 'framer-motion'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'

function Panel({ title, children }) {
  return (
    <div className="dv-card flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-800 dark:text-white/80">{title}</div>
        <div className="text-[11px] text-zinc-500 dark:text-white/50">Preview</div>
      </div>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </div>
  )
}

export function ProductPreview() {
  return (
    <section id="product" className="pt-16 md:pt-24">
      <Container>
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">See the product before you buy it</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-white/70 md:text-base">
            Three core surfaces: capture, timeline, and search—built to answer “why” with evidence.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Reveal className="h-full">
            <Panel title="Slack → Decision">
              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-200/70 bg-white p-4 dark:border-white/10 dark:bg-black/30">
                  <div className="text-[11px] text-zinc-500 dark:text-white/55">#platform • 2:14 PM</div>
                  <div className="mt-2 text-sm text-zinc-900 dark:text-white/85">
                    “Let’s go with Postgres now; we’ll revisit multi-region later.”
                  </div>
                  <div className="mt-3 flex gap-2 text-[11px] text-zinc-500 dark:text-white/50">
                    <span className="rounded bg-zinc-900/5 px-2 py-1 dark:bg-white/10">✅ decided</span>
                    <span className="rounded bg-zinc-900/5 px-2 py-1 dark:bg-white/10">thread link</span>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200/70 bg-gradient-to-b from-cyan-500/10 to-indigo-500/10 p-4 dark:border-white/10">
                  <div className="text-[11px] text-zinc-600 dark:text-white/55">Decision record</div>
                  <div className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">
                    Use PostgreSQL for Stage 1 storage
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-zinc-700 dark:text-white/60">
                    <div className="rounded-lg border border-zinc-200/70 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                      Context
                    </div>
                    <div className="rounded-lg border border-zinc-200/70 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                      Alternatives
                    </div>
                    <div className="rounded-lg border border-zinc-200/70 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                      Risks
                    </div>
                    <div className="rounded-lg border border-zinc-200/70 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/20">
                      Evidence
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={0.05} className="h-full">
            <Panel title="Timeline">
              <div className="space-y-3">
                {[
                  { t: 'RBAC in Stage 1', d: 'Feb 07', tag: 'Security' },
                  { t: 'Postgres for decisions', d: 'Feb 10', tag: 'Architecture' },
                  { t: 'Slack capture rules', d: 'Feb 14', tag: 'Integrations' },
                ].map((row) => (
                  <div
                    key={row.t}
                    className="rounded-xl border border-zinc-200/70 bg-white p-4 dark:border-white/10 dark:bg-black/25"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-white/85">{row.t}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-white/55">{row.d}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-600 dark:text-white/60">
                      <span className="rounded-full bg-zinc-900/5 px-3 py-1 dark:bg-white/10">{row.tag}</span>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-200">
                        v2
                      </span>
                      <span className="rounded-full bg-zinc-900/5 px-3 py-1 dark:bg-white/10">2 evidence links</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <Panel title="“Why did we?” Search">
              <div className="rounded-xl border border-zinc-200/70 bg-white p-4 dark:border-white/10 dark:bg-black/25">
                <div className="text-[11px] text-zinc-500 dark:text-white/55">Query</div>
                <div className="mt-2 rounded-lg border border-zinc-200/70 bg-zinc-900/5 px-3 py-2 text-sm text-zinc-800 dark:border-white/10 dark:bg-black/35 dark:text-white/80">
                  Why did we defer SSO?
                </div>
                <div className="mt-4 text-[11px] text-zinc-500 dark:text-white/55">Top result</div>
                <div className="mt-2 rounded-xl border border-zinc-200/70 bg-gradient-to-b from-zinc-900/5 to-zinc-900/0 p-4 dark:border-white/10 dark:from-white/10 dark:to-white/5">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white/85">SSO deferred to Stage 2</div>
                  <div className="mt-2 text-sm text-zinc-600 dark:text-white/70">
                    Chosen to keep onboarding fast while validating retention. Decision includes trade-offs and evidence.
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-white/55">
                    <span className="rounded bg-zinc-900/5 px-2 py-1 dark:bg-white/10">Open evidence</span>
                    <span className="rounded bg-zinc-900/5 px-2 py-1 dark:bg-white/10">View versions</span>
                  </div>
                </div>
              </div>
              <motion.div
                className="pointer-events-none mt-4 rounded-2xl border border-zinc-200/70 bg-white/70 p-4 text-[11px] text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-white/55"
                animate={{ opacity: [0.6, 0.95, 0.6] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                Evidence-first: no fabricated answers when no matching decision exists.
              </motion.div>
            </Panel>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
