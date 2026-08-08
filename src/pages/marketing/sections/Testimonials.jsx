import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Cross2Icon, ShuffleIcon, TwitterLogoIcon } from '@radix-ui/react-icons'

const testimonials = [
  {
    quote:
      'We stopped re-litigating the same decisions. The team’s confidence went up because the reasoning stayed visible.',
    name: 'Engineering Lead',
    company: 'Series A SaaS',
    handle: 'eng-lead',
  },
  {
    quote:
      'Onboarding changed completely—new hires search for “why” and get the original context plus evidence in one place.',
    name: 'CTO',
    company: 'Platform team',
    handle: 'cto',
  },
  {
    quote: 'Evidence links made the difference. People trust the answers because they can verify them instantly.',
    name: 'Product Manager',
    company: 'B2B product org',
    handle: 'pm',
  },
  {
    quote:
      'We finally have a system of record for decisions. When priorities shift, we can see what changed and why.',
    name: 'Founder',
    company: 'Dev tools startup',
    handle: 'founder',
  },
  {
    quote:
      'The “why did we?” search is the first thing people use in planning. It prevents accidental scope creep.',
    name: 'Tech Lead',
    company: 'Enterprise team',
    handle: 'tech-lead',
  },
  {
    quote:
      'Versioning changed how we discuss trade-offs. Decisions feel deliberate, not lost in a thread from months ago.',
    name: 'Product Ops',
    company: 'Growth org',
    handle: 'prod-ops',
  },
]

function initialsFromName(name) {
  const parts = String(name || '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'DV'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function shuffleIndices(n) {
  const out = Array.from({ length: n }, (_, i) => i)
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

export function Testimonials() {
  const all = useMemo(() => testimonials, [])
  const [deck, setDeck] = useState(() => shuffleIndices(all.length))
  const [pos, setPos] = useState(0)

  const activeIndex = deck[pos] ?? deck[0] ?? 0
  const active = all[activeIndex]

  const advance = () => {
    setPos((p) => {
      const next = p + 1
      if (next < deck.length) return next
      setDeck(shuffleIndices(all.length))
      return 0
    })
  }

  const shuffleOne = () => {
    if (all.length <= 1) return
    const choices = deck.filter((i) => i !== activeIndex)
    const next = choices[Math.floor(Math.random() * choices.length)]
    setDeck([next, ...shuffleIndices(all.length).filter((i) => i !== next)])
    setPos(0)
  }

  return (
    <section className="pt-16 md:pt-24">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">What teams say</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-white/70 md:text-base">
                A few real-world “tweets” from teams who got tired of losing context.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={shuffleOne}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-zinc-800 shadow-soft transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
              >
                <ShuffleIcon width="16" height="16" />
                Shuffle
              </button>
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/5 px-3 py-2 text-xs text-zinc-600 dark:bg-white/10 dark:text-white/65">
                <TwitterLogoIcon width="14" height="14" />
                {Math.min(pos + 1, all.length)}/{all.length}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="relative mt-8">
          <div className="pointer-events-none absolute left-1/2 top-6 hidden h-[260px] w-[560px] -translate-x-1/2 rounded-[32px] bg-gradient-to-r from-blue-500/15 via-blue-500/15 to-blue-500/15 blur-3xl md:block" />

          <div className="relative mx-auto max-w-[760px]">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-7 h-full w-[92%] -translate-x-1/2 rotate-[-1.5deg] rounded-2xl border border-zinc-200/50 bg-white/40 shadow-soft dark:border-white/10 dark:bg-white/5" />
              <div className="absolute left-1/2 top-12 h-full w-[86%] -translate-x-1/2 rotate-[1.2deg] rounded-2xl border border-zinc-200/50 bg-white/35 shadow-soft dark:border-white/10 dark:bg-white/5" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active?.quote || String(activeIndex)}
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.35, ease: [0.21, 0.9, 0.2, 1] }}
                className="rounded-2xl border border-zinc-200/70 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-zinc-950/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200/70 bg-white text-sm font-semibold text-zinc-900 dark:border-white/10 dark:bg-black/25 dark:text-white">
                      {initialsFromName(active?.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <div className="text-sm font-semibold text-zinc-900 dark:text-white">{active?.name}</div>
                        <div className="text-sm text-zinc-500 dark:text-white/55">@{active?.handle}</div>
                        <div className="hidden text-sm text-zinc-400 dark:text-white/35 sm:block">·</div>
                        <div className="text-sm text-zinc-500 dark:text-white/55">{active?.company}</div>
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500 dark:text-white/55">
                        Decision context, evidence links, version history.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={advance}
                    aria-label="Close and show next"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-zinc-200/70 bg-white/70 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-zinc-900/5 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                  >
                    <Cross2Icon width="16" height="16" />
                  </button>
                </div>

                <div className="mt-5 text-base leading-relaxed text-zinc-800 dark:text-white/85">
                  “{active?.quote}”
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/5 px-3 py-1 text-[11px] text-zinc-600 dark:bg-white/10 dark:text-white/65">
                    <TwitterLogoIcon width="14" height="14" />
                    Shuffled testimonials
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-white/55">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-800 dark:text-blue-200">
                      Evidence-first
                    </span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-800 dark:text-blue-200">
                      Versioned
                    </span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-800 dark:text-blue-200">
                      Searchable
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  )
}
