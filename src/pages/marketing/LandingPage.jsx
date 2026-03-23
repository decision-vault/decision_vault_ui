import { Navbar } from './sections/Navbar'
import { Hero } from './sections/Hero'
import { Problem } from './sections/Problem'
import { Solution } from './sections/Solution'
import { ProductPreview } from './sections/ProductPreview'
import { Features } from './sections/Features'
import { Workflow } from './sections/Workflow'
import { Integrations } from './sections/Integrations'
import { UseCases } from './sections/UseCases'
import { Testimonials } from './sections/Testimonials'
import { PricingPreview } from './sections/PricingPreview'
import { CTASection } from './sections/CTASection'
import { Footer } from './sections/Footer'

export function LandingPage() {
  return (
    <div
      id="top"
      className="relative min-h-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <div className="pointer-events-none absolute inset-0 dv-grid opacity-[0.22]" />
      <div className="pointer-events-none absolute inset-0 dv-noise" />

      <div className="pointer-events-none absolute -top-28 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/30 via-cyan-400/20 to-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500/15 via-indigo-500/15 to-cyan-500/15 blur-3xl" />

      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <ProductPreview />
        <Features />
        <Workflow />
        <Integrations />
        <UseCases />
        <Testimonials />
        <PricingPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

