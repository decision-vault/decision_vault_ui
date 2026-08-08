import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { ChatBubbleIcon, FileTextIcon, LoopIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons'

const bullets = [
  {
    icon: ChatBubbleIcon,
    tone: 'bg-blue-500/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
    text: 'Decisions scatter across Slack, docs, PRs, and meeting notes.',
  },
  {
    icon: FileTextIcon,
    tone: 'bg-blue-500/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
    text: 'Context evaporates after a few sprints and new teammates have to dig for answers.',
  },
  {
    icon: LoopIcon,
    tone: 'bg-blue-500/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
    text: 'Teams re-debate the same trade-offs, reverse decisions blindly, and repeat mistakes.',
  },
  {
    icon: QuestionMarkCircledIcon,
    tone: 'bg-fuchsia-500/10 text-fuchsia-800 dark:bg-fuchsia-400/10 dark:text-fuchsia-200',
    text: 'When leadership asks “why”, the team reconstructs reasoning from memory and fragments.',
  },
]

export function Problem() {
  return (
    <section className="pt-16 md:pt-24">
      <Container>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">The quiet cost of lost reasoning</h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-white/70 md:text-base">
                Shipping faster means more decisions. Without a system of record, your organization’s memory becomes a
                set of brittle guesses.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <Reveal>
              <div className="dv-card p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {bullets.map((b) => (
                    <div
                      key={b.text}
                      className="flex h-full flex-col rounded-2xl border border-zinc-200/70 bg-white p-4 dark:border-white/10 dark:bg-black/20"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${b.tone}`}>
                          <b.icon width="18" height="18" />
                        </span>
                        <div className="pt-1 text-sm leading-relaxed text-zinc-600 dark:text-white/70">{b.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}
