import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'

const features = [
  {
    title: 'Automatic Decision Capture',
    desc: 'Detect decision moments from Slack threads and turn them into structured records.',
    icon: <path d="M6 9h12M6 13h8M6 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  },
  {
    title: 'Versioned Decision History',
    desc: 'Updates create new versions—original context stays intact and reviewable.',
    icon: <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: '“Why did we?” Search',
    desc: 'Find decisions by intent, not file names. Answers link to evidence.',
    icon: (
      <path
        d="M11 11a4 4 0 1 0 0.001 0ZM20 20l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: 'Evidence Linking',
    desc: 'Every decision can point back to the source: Slack, docs, uploads, PR links.',
    icon: (
      <path
        d="M10 13a5 5 0 0 1 7 0M8 15a7 7 0 0 1 10 0M6 17a9 9 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: 'Task Manager (From Decisions)',
    desc: 'Turn decisions into executable work: epics, tasks, owners, and acceptance criteria.',
    icon: (
      <path
        d="M8 7h10M8 12h10M8 17h6M6.5 7l-1 1-1-1M6.5 12l-1 1-1-1M6.5 17l-1 1-1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Agent Lineup: Dev → Test → Fix → Deploy',
    desc: 'A staged delivery lane where specialized agents implement, test, fix regressions, and ship.',
    icon: (
      <path
        d="M7 7h10M7 12h10M7 17h10M5 7h.01M5 12h.01M5 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: 'Security Checks in the Loop',
    desc: 'Security agents review permissions, secrets, and risky changes before deploy.',
    icon: (
      <path
        d="M12 3l7 4v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4Zm0 6v4m0 4h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
]

export function Features() {
  return (
    <section id="features" className="pt-16 md:pt-24">
      <Container>
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Features</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-white/70 md:text-base">
                Capture decision history and drive execution with an agentic delivery lane that keeps quality and security in view.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {features.map((f, idx) => (
            <Reveal key={f.title} delay={idx * 0.06}>
              <div className="group rounded-2xl border border-zinc-200/70 bg-gradient-to-b from-zinc-900/5 to-zinc-900/0 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:from-white/10 dark:to-white/5">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200/70 bg-white text-cyan-700 dark:border-white/10 dark:bg-black/25 dark:text-cyan-200">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      {f.icon}
                    </svg>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-zinc-900 dark:text-white">{f.title}</div>
                    <div className="mt-2 text-sm text-zinc-600 dark:text-white/70">{f.desc}</div>
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
