import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { Logo } from '../components/Logo'

const links = [
  { label: 'Docs', to: '/docs' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Contact', href: 'mailto:hello@decisionvault.ai' },
]

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white/70 dark:border-white/5 dark:bg-zinc-950/70">
      <Container>
        <div className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xs text-zinc-500 dark:text-white/45">
              © {new Date().getFullYear()} DecisionVault. All rights reserved.
            </span>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-zinc-600 dark:text-white/65">
            {links.map((l) =>
              l.to ? (
                <Link
                  key={l.label}
                  to={l.to}
                  className="text-zinc-700 hover:text-zinc-950 dark:text-white/65 dark:hover:text-white"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-zinc-700 hover:text-zinc-950 dark:text-white/65 dark:hover:text-white"
                >
                  {l.label}
                </a>
              ),
            )}
          </div>
        </div>
      </Container>
    </footer>
  )
}

