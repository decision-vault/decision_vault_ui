import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import {
  ArrowRightIcon,
  ClipboardIcon,
  CodeIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  RocketIcon,
  LockClosedIcon,
} from '@radix-ui/react-icons'

const steps = [
  {
    id: '01',
    title: 'Task Manager',
    desc: 'Turn decisions into epics, tasks, owners, and acceptance criteria.',
    icon: ClipboardIcon,
    tone: 'bg-blue-500/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
  },
  {
    id: '02',
    title: 'Dev Agent',
    desc: 'Implements changes with repo context and conventions.',
    icon: CodeIcon,
    tone: 'bg-blue-500/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
  },
  {
    id: '03',
    title: 'Test Agent',
    desc: 'Runs and expands tests. Verifies behavior before merge.',
    icon: CheckCircledIcon,
    tone: 'bg-blue-500/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
  },
  {
    id: '04',
    title: 'Bugfix Agent',
    desc: 'Triages failures, fixes regressions, and tightens edge cases.',
    icon: ExclamationTriangleIcon,
    tone: 'bg-fuchsia-500/10 text-fuchsia-800 dark:bg-fuchsia-400/10 dark:text-fuchsia-200',
  },
  {
    id: '05',
    title: 'Deploy Agent',
    desc: 'Ships the app with checks, rollout notes, and monitoring hooks.',
    icon: RocketIcon,
    tone: 'bg-amber-500/10 text-amber-900 dark:bg-amber-400/10 dark:text-amber-200',
  },
]

export function Workflow() {
  return (
    <section id="workflow" className="pt-16 md:pt-24">
      <Container>
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Workflow</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-white/70 md:text-base">
            A delivery lane where specialized agents run in sequence, with security checks in the loop.
          </p>
        </Reveal>

        <div className="mt-8">
          <div className="hidden md:block">
            <Reveal>
              <div className="dv-card p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-white/55">Agent workflow</div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/5 px-3 py-1 text-xs text-zinc-600 dark:bg-white/10 dark:text-white/70">
                    <LockClosedIcon width="14" height="14" />
                    Security agent checks throughout
                  </div>
                </div>
                <div className="flex items-stretch gap-3">
                  {steps.map((s, idx) => (
                    <div key={s.id} className="flex flex-1 items-stretch">
                      <div className="flex w-full flex-col rounded-2xl border border-zinc-200/70 bg-white/70 p-5 dark:border-white/10 dark:bg-black/20">
                        <div className="flex items-center justify-between gap-3">
                          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${s.tone}`}>
                            <s.icon width="18" height="18" />
                          </span>
                          <span className="text-[11px] font-semibold text-zinc-500 dark:text-white/55">{s.id}</span>
                        </div>
                        <div className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">{s.title}</div>
                        <div className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-white/70">{s.desc}</div>
                        <div className="flex-1" />
                        <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-white/55">
                          <LockClosedIcon width="14" height="14" />
                          Security review
                        </div>
                      </div>
                      {idx < steps.length - 1 ? (
                        <div className="flex w-12 flex-col items-center justify-center">
                          <div className="h-px w-full bg-zinc-200/70 dark:bg-white/10" />
                          <div className="-mt-3 rounded-full bg-white p-1 text-zinc-400 shadow-soft dark:bg-zinc-950 dark:text-white/40">
                            <ArrowRightIcon width="16" height="16" />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="md:hidden">
            <Reveal>
              <div className="dv-card p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-white/55">Agent workflow</div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/5 px-3 py-1 text-xs text-zinc-600 dark:bg-white/10 dark:text-white/70">
                    <LockClosedIcon width="14" height="14" />
                    Security checks
                  </div>
                </div>

                <div className="relative pl-5">
                  <div className="absolute left-2 top-1 bottom-1 w-px bg-zinc-200/70 dark:bg-white/10" />
                  <div className="space-y-4">
                    {steps.map((s) => (
                      <div key={s.id} className="relative">
                        <div className="absolute -left-[6px] top-4 h-3 w-3 rounded-full bg-white ring-2 ring-zinc-200/70 dark:bg-zinc-950 dark:ring-white/10" />
                        <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-5 dark:border-white/10 dark:bg-black/20">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${s.tone}`}>
                                <s.icon width="18" height="18" />
                              </span>
                              <div className="text-sm font-semibold text-zinc-900 dark:text-white">{s.title}</div>
                            </div>
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-white/55">{s.id}</span>
                          </div>
                          <div className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-white/70">{s.desc}</div>
                          <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-white/55">
                            <LockClosedIcon width="14" height="14" />
                            Security review
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}
