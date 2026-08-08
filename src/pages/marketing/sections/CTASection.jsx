import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Button } from '../components/Button'
import { Link } from 'react-router-dom'

export function CTASection() {
  return (
    <section className="pt-16 pb-16 md:pt-24 md:pb-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-zinc-200/70 bg-gradient-to-r from-blue-500/20 via-blue-500/20 to-blue-500/20 p-10 shadow-soft dark:border-white/10">
            <div className="pointer-events-none absolute inset-0 bg-white/30 dark:bg-black/20" />
            <div className="relative">
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Make “why” searchable in your organization.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-700 dark:text-white/70 md:text-base">
                Start with Stage 1: decision capture, versioning, timeline, and evidence-first search.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link to="/signup">Book Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
