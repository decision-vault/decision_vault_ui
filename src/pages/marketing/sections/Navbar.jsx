import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'

const items = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Pricing', href: '#pricing' },
]

export function Navbar() {
  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/70 backdrop-blur dark:border-white/5 dark:bg-zinc-950/70">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <a href="#top" className="flex items-center">
            <Logo />
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {items.map((item) => (
              <a key={item.href} href={item.href} className="dv-link text-sm">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }} className="hidden md:inline-flex">
              <Link
                className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 dark:text-white/70 dark:hover:text-white"
                to="/login"
              >
                Sign in
              </Link>
            </motion.div>
            <Button asChild variant="secondary" className="hidden md:inline-flex">
              <Link to="/signup">Book Demo</Link>
            </Button>
            <Button asChild className="inline-flex">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
