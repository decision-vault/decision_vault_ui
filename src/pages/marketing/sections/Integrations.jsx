import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'

function BrandIcon({ name }) {
  const common =
    'h-11 w-11 rounded-2xl border border-zinc-200/70 bg-white p-2 shadow-soft dark:border-white/10 dark:bg-black/30'
  if (name === 'Slack') {
    return (
      <span className={`${common} inline-flex items-center justify-center`} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="overflow-visible">
          <path d="M14.4 3.6a2.1 2.1 0 0 1 2.1 2.1v3.3h-2.1a2.1 2.1 0 1 1 0-4.2Z" fill="#36C5F0" />
          <path d="M20.4 9a2.1 2.1 0 0 1-2.1 2.1H15V9a2.1 2.1 0 1 1 4.2 0Z" fill="#2EB67D" />
          <path d="M9 20.4a2.1 2.1 0 0 1-2.1-2.1V15h2.1a2.1 2.1 0 1 1 0 4.2Z" fill="#E01E5A" />
          <path d="M3.6 15a2.1 2.1 0 0 1 2.1-2.1H9v2.1a2.1 2.1 0 1 1-4.2 0Z" fill="#ECB22E" />
          <path d="M9 3.6h3.3v6H9a2.1 2.1 0 1 1 0-4.2Z" fill="#36C5F0" />
          <path d="M20.4 12.3V15h-6v-2.7a2.1 2.1 0 1 1 4.2 0h1.8Z" fill="#2EB67D" />
          <path d="M15 20.4h-3.3v-6H15a2.1 2.1 0 1 1 0 4.2Z" fill="#E01E5A" />
          <path d="M3.6 11.7V9h6v2.7a2.1 2.1 0 1 1-4.2 0H3.6Z" fill="#ECB22E" />
        </svg>
      </span>
    )
  }

  if (name === 'Google Docs') {
    return (
      <span className={`${common} inline-flex items-center justify-center`} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="overflow-visible">
          <path d="M6 3h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="#4285F4" />
          <path d="M14 3v4h4" fill="#AECBFA" />
          <path d="M7.5 11h9" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
          <path d="M7.5 14h9" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
          <path d="M7.5 17h6.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
        </svg>
      </span>
    )
  }

  if (name === 'Notion') {
    return (
      <span className={`${common} inline-flex items-center justify-center`} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="overflow-visible">
          <path
            d="M6.5 4.5h11l1 2v13l-1 1H6.5l-1-1v-13l1-2Z"
            fill="white"
            stroke="black"
            className="dark:fill-zinc-950 dark:stroke-white/80"
            strokeWidth="1.2"
          />
          <path
            d="M9 8v8M9 8h2.1l4.4 8H17V8"
            stroke="black"
            className="dark:stroke-white/80"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }

  if (name === 'GitHub') {
    return (
      <span className={`${common} inline-flex items-center justify-center`} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="overflow-visible">
          <path
            d="M12 2.6a9.4 9.4 0 0 0-2.97 18.33c.47.09.64-.2.64-.45v-1.66c-2.6.57-3.15-1.1-3.15-1.1-.43-1.1-1.05-1.4-1.05-1.4-.86-.6.06-.6.06-.6.95.07 1.45.98 1.45.98.84 1.44 2.2 1.03 2.74.79.08-.61.33-1.03.6-1.27-2.08-.24-4.26-1.05-4.26-4.67 0-1.03.37-1.88.98-2.55-.1-.24-.43-1.22.09-2.54 0 0 .8-.26 2.6.97A8.96 8.96 0 0 1 12 6.9c.8 0 1.61.11 2.36.33 1.8-1.23 2.6-.97 2.6-.97.52 1.32.2 2.3.1 2.54.61.67.98 1.52.98 2.55 0 3.63-2.19 4.43-4.28 4.66.34.29.64.86.64 1.74v2.58c0 .25.17.55.65.45A9.4 9.4 0 0 0 12 2.6Z"
            fill="currentColor"
            className="text-zinc-900 dark:text-white"
            opacity="0.92"
          />
        </svg>
      </span>
    )
  }

  return <span className={`${common} inline-flex`} aria-hidden="true" />
}

const integrations = [
  { name: 'Slack', desc: 'Capture decisions from threads and reactions.' },
  { name: 'Google Docs', desc: 'Link design docs and meeting notes as evidence.' },
  { name: 'Notion', desc: 'Import existing ADRs and decision logs.' },
  { name: 'GitHub', desc: 'Attach PR links to decisions (manual in Stage 1).' },
]

export function Integrations() {
  return (
    <section id="integrations" className="pt-16 md:pt-24">
      <Container>
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Integrations</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-white/70 md:text-base">
            Start where your team already works. Evidence is only useful when it’s close to the source.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((i, idx) => (
            <Reveal key={i.name} delay={idx * 0.04}>
              <div className="rounded-2xl border border-zinc-200/70 bg-gradient-to-b from-zinc-900/5 to-zinc-900/0 p-5 shadow-soft dark:border-white/10 dark:from-white/10 dark:to-white/5">
                <div className="flex items-start gap-4">
                  <BrandIcon name={i.name} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white">{i.name}</div>
                    <div className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-white/70">{i.desc}</div>
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
