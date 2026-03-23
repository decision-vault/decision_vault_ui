import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Button } from '../components/Button'
import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: '$49',
    note: 'per month',
    bullets: ['Up to 15 users', 'Unlimited projects', 'Decision timeline + search', 'Slack capture (basic)'],
    emphasis: false,
  },
  {
    name: 'Team',
    price: '$149',
    note: 'per month',
    bullets: ['Up to 50 users', 'Usage analytics', 'Priority support', 'Advanced capture tuning'],
    emphasis: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    note: 'annual',
    bullets: ['SSO & security reviews', 'SLA + dedicated support', 'Data controls', 'On-prem (roadmap)'],
    emphasis: false,
  },
]

export function PricingPreview() {
  return (
    <section id="pricing" className="pt-16 md:pt-24">
      <Container>
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Pricing</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-white/70 md:text-base">
            Simple tiers that scale with your team. Start with a trial, then upgrade when the decision log becomes
            habit.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((p, idx) => (
            <Reveal key={p.name} delay={idx * 0.06}>
              <div
                className={[
                  'rounded-2xl border p-6 shadow-soft transition hover:-translate-y-1',
                  p.emphasis
                    ? 'border-cyan-500/30 bg-gradient-to-b from-cyan-500/15 to-zinc-900/0 hover:shadow-glow dark:to-white/5'
                    : 'border-zinc-200/70 bg-white/75 hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20',
                ].join(' ')}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-base font-semibold text-zinc-900 dark:text-white">{p.name}</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-white/55">{p.note}</div>
                  </div>
                  {p.emphasis ? (
                    <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] text-cyan-700 dark:text-cyan-100">
                      Most popular
                    </div>
                  ) : null}
                </div>
                <div className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {p.price}
                  {p.price !== 'Custom' ? <span className="text-base text-zinc-500 dark:text-white/55">/mo</span> : null}
                </div>
                <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-white/70">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-white/40" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button asChild variant={p.emphasis ? 'primary' : 'secondary'} className="w-full">
                    <Link to={p.name === 'Enterprise' ? '/book-demo' : '/signup'}>
                      {p.name === 'Enterprise' ? 'Contact sales' : 'Start trial'}
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
