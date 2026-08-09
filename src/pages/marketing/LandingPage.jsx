import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './marketing-dark.css'
import {
  ArrowRight,
  Bot,
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Code2,
  Database,
  FileCode2,
  GitBranch,
  LayoutDashboard,
  Layers3,
  Lock,
  Menu,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import { Logo } from './components/Logo'
import { Button } from './components/Button'

const productTiles = [
  {
    icon: Database,
    title: 'Decision Memory',
    body: 'Capture product choices, alternatives, owners, evidence, and tradeoffs in one searchable vault.',
    accent: 'blue',
  },
  {
    icon: Bot,
    title: 'AI Engineering Agents',
    body: 'Give agents task context, related files, specs, and approval-gated write access.',
    accent: 'blue',
  },
  {
    icon: Terminal,
    title: 'Local Workspace',
    body: 'Open projects, inspect source, run CLI commands, preview diffs, and track every change.',
    accent: 'blue',
  },
  {
    icon: Workflow,
    title: 'Workflow Builder',
    body: 'Turn product discovery into PRDs, system design, tasks, tests, and implementation plans.',
    accent: 'blue',
  },
  {
    icon: ShieldCheck,
    title: 'Approval Gates',
    body: 'No generated file is written until the team reviews the diff and approves the change.',
    accent: 'blue',
  },
  {
    icon: GitBranch,
    title: 'Traceable Delivery',
    body: 'Connect tasks, commands, generated files, tests, commits, and decision history.',
    accent: 'blue',
  },
]

const logos = ['NovaWorks', 'Northstar', 'FigmaOps', 'LinearLab', 'PulseHQ', 'Atlas AI', 'Modecraft', 'Shipyard']

const templates = [
  { title: 'Auth API Sprint', meta: 'FastAPI + RBAC + tests', icon: Lock },
  { title: 'Local Code Agent', meta: 'Project scan + diff approval', icon: FileCode2 },
  { title: 'Discovery to PRD', meta: 'Idea intake + generated spec', icon: Sparkles },
  { title: 'Release Readiness', meta: 'Tasks + risks + checklist', icon: Boxes },
]

const stories = [
  {
    company: 'Finpilot',
    color: 'bg-orange-600',
    quote:
      'Kavi AI helped our product and engineering leads understand why work was prioritized, what evidence mattered, and what changed between versions.',
  },
  {
    company: 'Northlake',
    color: 'bg-blue-600',
    quote: 'The local workspace flow made generated code safer because every change had a preview, a diff, and a task trail.',
  },
  {
    company: 'Orbital',
    color: 'bg-zinc-900',
    quote: 'We stopped losing architecture context between Slack, tickets, and docs. The decision history became the source of truth.',
  },
  {
    company: 'Cedar AI',
    color: 'bg-blue-600',
    quote: 'Our agents finally had the project context they needed without bypassing human approval.',
  },
]

const communityCards = [
  'Decision records that engineers actually read.',
  'PRDs, tasks, and implementation context stay connected.',
  'Approval-first agent workflows for local codebases.',
  'Search answers cite the evidence, not a guess.',
  'Track generated files, commands, tests, and commits.',
  'Keep product memory alive after roadmap changes.',
]

const menuProducts = [
  {
    icon: Database,
    title: 'Decision Vault',
    body: 'Searchable records for product decisions, tradeoffs, owners, and evidence.',
  },
  {
    icon: Bot,
    title: 'AI Agents',
    body: 'Engineering agents that read context, propose changes, and wait for approval.',
  },
  {
    icon: Terminal,
    title: 'Local Workspace',
    body: 'Open codebases, run CLI commands, inspect Git, and preview diffs securely.',
  },
  {
    icon: Workflow,
    title: 'Workflow Builder',
    body: 'Turn discovery into PRDs, system designs, implementation tasks, and tests.',
  },
  {
    icon: ShieldCheck,
    title: 'Approval Gates',
    body: 'Human review for every generated file, command result, and code change.',
  },
]

const menuModules = [
  {
    icon: Search,
    title: 'Knowledge Search',
    body: 'Ask why a choice was made and get cited answers.',
  },
  {
    icon: ClipboardList,
    title: 'Task Graph',
    body: 'Connect work items to related files, commands, tests, and commits.',
  },
  {
    icon: Code2,
    title: 'Diff Viewer',
    body: 'Review added, modified, and deleted files before applying changes.',
  },
  {
    icon: Layers3,
    title: 'Product Templates',
    body: 'Kickstart auth, release, discovery, and code-agent workflows.',
  },
]

const menuComparisons = [
  'Kavi AI vs Notion',
  'Kavi AI vs Jira',
  'Kavi AI vs Linear',
  'Kavi AI vs ChatGPT',
]

const megaMenus = {
  product: {
    primary: menuProducts,
    modules: menuModules,
    modulesTitle: 'Modules',
    featureTitle: 'Features',
    featureBody: 'Explore everything Kavi AI can do for product teams.',
    storyTitle: 'How product teams keep architecture, tasks, and agent work aligned',
    compareTitle: 'Compare Kavi AI',
    comparisons: menuComparisons,
  },
  developers: {
    primary: [
      {
        icon: Code2,
        title: 'API & SDKs',
        body: 'Connect product context, workflows, and generated artifacts to your stack.',
      },
      {
        icon: Terminal,
        title: 'CLI Commands',
        body: 'Run npm, Python, Git, Docker, Terraform, Go, Rust, and test commands locally.',
      },
      {
        icon: FileCode2,
        title: 'Code Intelligence',
        body: 'Index project structure, dependencies, frameworks, files, and architecture.',
      },
      {
        icon: GitBranch,
        title: 'Git Workflows',
        body: 'Review status, diffs, branches, commits, generated files, and test output.',
      },
      {
        icon: ShieldCheck,
        title: 'Secure Write Policy',
        body: 'Require approval before agents create, modify, move, or delete project files.',
      },
    ],
    modules: [
      {
        icon: Search,
        title: 'Code Search',
        body: 'Find files, symbols, and related implementation context.',
      },
      {
        icon: Bot,
        title: 'Agent Runtime',
        body: 'Give agents task, PRD, design, and project-tree context.',
      },
      {
        icon: ClipboardList,
        title: 'Test Runner',
        body: 'Run checks after approved changes and attach results to tasks.',
      },
      {
        icon: Layers3,
        title: 'Dependency Graph',
        body: 'Detect package managers, build systems, Docker, and Terraform.',
      },
    ],
    modulesTitle: 'Developer Tools',
    featureTitle: 'Developer Docs',
    featureBody: 'Read guides for local workspace setup, API usage, and approval-gated agents.',
    storyTitle: 'How engineering teams ship AI-generated changes with reviewable diffs',
    compareTitle: 'Developer Guides',
    comparisons: ['Local workspace setup', 'Approval-gated file writes', 'Terminal command allowlist', 'Git diff review'],
  },
  solutions: {
    primary: [
      {
        icon: Sparkles,
        title: 'Product Discovery',
        body: 'Turn ideas, notes, and research into structured PRDs and workflow tasks.',
      },
      {
        icon: Workflow,
        title: 'Delivery Workflow',
        body: 'Connect specs, system design, tickets, generated code, and release status.',
      },
      {
        icon: Database,
        title: 'Decision Governance',
        body: 'Keep owners, evidence, risks, alternatives, and change history searchable.',
      },
      {
        icon: Bot,
        title: 'AI Code Delivery',
        body: 'Let agents analyze source code and generate changes behind approval gates.',
      },
      {
        icon: Users,
        title: 'Team Alignment',
        body: 'Give product, design, and engineering a shared operating record.',
      },
    ],
    modules: [
      {
        icon: Lock,
        title: 'Auth API Sprint',
        body: 'Plan, generate, test, and review authentication work.',
      },
      {
        icon: Boxes,
        title: 'Release Readiness',
        body: 'Track tasks, risks, tests, generated files, and commit suggestions.',
      },
      {
        icon: MessageSquareText,
        title: 'Meeting to Decision',
        body: 'Convert discussions into evidence-linked decision records.',
      },
      {
        icon: LayoutDashboard,
        title: 'Executive Visibility',
        body: 'Summarize what changed, why it changed, and what remains blocked.',
      },
    ],
    modulesTitle: 'Solution Playbooks',
    featureTitle: 'Templates',
    featureBody: 'Start from proven workflows for discovery, implementation, releases, and reviews.',
    storyTitle: 'How teams preserve product memory while accelerating delivery',
    compareTitle: 'Use Cases',
    comparisons: ['Startup product teams', 'Platform engineering', 'AI-assisted delivery', 'Decision audit trails'],
  },
}

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>}
        <h2 className="max-w-xl text-balance text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function MiniDashboard() {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(24,24,27,0.08)]">
      <div className="flex h-10 items-center justify-between gap-2 border-b border-zinc-200 px-3">
        <div className="flex shrink-0 items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
        </div>
        <div className="min-w-0 truncate text-[11px] font-medium text-zinc-500">Kavi AI / workspace</div>
        <div className="h-5 w-14 shrink-0 rounded bg-zinc-100" />
      </div>
      <div className="grid min-h-[360px] grid-cols-1 bg-zinc-50/70 md:grid-cols-[48px_210px_minmax(0,1fr)]">
        <div className="hidden border-r border-zinc-200 bg-white py-4 md:block">
          {[LayoutDashboard, Search, Workflow, Terminal, GitBranch, Users].map((Icon, index) => (
            <div
              key={index}
              className={`mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-md ${
                index === 3 ? 'bg-blue-50 text-blue-700' : 'text-zinc-400'
              }`}
            >
              <Icon size={15} />
            </div>
          ))}
        </div>
        <div className="border-b border-zinc-200 bg-white p-4 md:border-b-0 md:border-r">
          <div className="mb-4 text-xs font-semibold text-zinc-950">Project Explorer</div>
          {['app/api/local_workspace.py', 'services/filesystem_service.py', 'src/pages/workspace', 'tasks/auth-api.md'].map(
            (item, index) => (
              <div
                key={item}
                className={`mb-2 rounded-md px-2 py-2 text-[11px] ${
                  index === 1 ? 'bg-blue-50 text-blue-800' : 'bg-zinc-50 text-zinc-500'
                }`}
              >
                {item}
              </div>
            ),
          )}
        </div>
        <div className="relative min-w-0 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-950">Create Authentication API</div>
              <div className="text-xs text-zinc-500">Agent preview requires approval before write</div>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-800">Diff ready</span>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-zinc-600">
              <FileCode2 size={14} />
              services/auth_service.py
            </div>
            <pre className="overflow-auto rounded-md bg-zinc-950 p-4 text-[11px] leading-relaxed text-zinc-100">
{`+ async def create_session(payload):
+   user = await users.find_by_email(payload.email)
+   token = issue_access_token(user)
+   return {"access_token": token}`}
            </pre>
          </div>
          <div className="mt-4 flex w-fit items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg md:absolute md:bottom-5 md:right-5 md:mt-0">
            <Check size={14} className="text-blue-600" />
            tests/auth_api_test.py passed
          </div>
        </div>
      </div>
    </div>
  )
}

function CodePanel() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
          <Code2 size={14} />
          workflow.ts
        </div>
        <div className="flex items-center gap-1">
          {['PRD', 'Design', 'Task', 'Diff'].map((tab, index) => (
            <span key={tab} className={`rounded px-2 py-1 text-[11px] ${index === 3 ? 'bg-blue-100 text-blue-800' : 'text-zinc-400'}`}>
              {tab}
            </span>
          ))}
        </div>
      </div>
      <pre className="overflow-auto p-5 text-[12px] leading-6 text-zinc-700">
{`const task = await vault.workflow.create({
  title: "Build local project workspace",
  context: ["prd", "system-design", "related-files"],
  agent: "engineering",
  writePolicy: "approval-required"
})

await task.generateDiff()
await task.runTests()
await task.suggestCommit()`}
      </pre>
    </div>
  )
}

export function LandingPage() {
  const [activeMenu, setActiveMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeMegaMenu = activeMenu ? megaMenus[activeMenu] : null

  return (
    <div id="top" className="landing-page min-h-screen overflow-x-hidden bg-white text-zinc-950">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl">
        <div
          onMouseLeave={() => setActiveMenu(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setActiveMenu(null)
            }
          }}
        >
          <div className="mx-auto grid h-14 max-w-[1180px] grid-cols-[1fr_auto] items-center gap-3 px-4 md:grid-cols-[220px_minmax(0,1fr)_360px] md:px-5">
            <a href="#top" className="flex items-center justify-self-start">
              <Logo size={22} />
            </a>
            <nav className="landing-nav hidden items-center justify-center gap-6 text-[15px] font-medium text-zinc-900 md:flex">
              <button
                type="button"
                className={`landing-nav-trigger inline-flex items-center gap-1.5 text-[15px] font-medium transition ${
                  activeMenu === 'product' ? 'text-blue-700' : 'text-zinc-900 hover:text-blue-700'
                }`}
                onMouseEnter={() => setActiveMenu('product')}
                onFocus={() => setActiveMenu('product')}
                onClick={() => setActiveMenu((menu) => (menu === 'product' ? null : 'product'))}
                aria-expanded={activeMenu === 'product'}
              >
                Product
                <ChevronDown size={15} className={`transition ${activeMenu === 'product' ? 'rotate-180' : ''}`} />
              </button>
              {['Developers', 'Solutions'].map((item) => {
                const key = item.toLowerCase()
                const isOpen = activeMenu === key
                return (
                <button
                  key={item}
                  type="button"
                  className={`landing-nav-trigger inline-flex items-center gap-1.5 text-[15px] font-medium transition ${
                    isOpen ? 'text-blue-700' : 'text-zinc-900 hover:text-blue-700'
                  }`}
                  onMouseEnter={() => setActiveMenu(key)}
                  onFocus={() => setActiveMenu(key)}
                  onClick={() => setActiveMenu((menu) => (menu === key ? null : key))}
                  aria-expanded={isOpen}
                >
                  {item}
                  <ChevronDown size={15} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              )})}
              {['Pricing', 'Docs', 'Blog'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="landing-nav-link">
                  {item}
                </a>
              ))}
            </nav>
            <div className="flex items-center justify-end gap-3 justify-self-end">
              <div className="hidden items-center gap-2 text-sm font-semibold text-zinc-600 xl:flex">
                <GitBranch size={20} />
                107.6K
              </div>
              <Link
                to="/login"
                className="hidden rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 sm:block"
              >
                Sign in
              </Link>
              <Button asChild className="hidden rounded-md px-3 py-2 text-sm sm:inline-flex">
                <Link to="/signup">Start your project</Link>
              </Button>
              <button
                type="button"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((open) => !open)}
                className="rounded-md border border-zinc-200 p-2 text-zinc-700 hover:bg-zinc-50 md:hidden"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="border-t border-zinc-200 bg-white px-4 py-4 md:hidden">
              <nav className="flex flex-col gap-1">
                {[{ label: 'Product', href: '#product' }, { label: 'Developers', href: '#developers' }, { label: 'Pricing', href: '#pricing' }, { label: 'Docs', href: '#docs' }, { label: 'Blog', href: '#blog' }].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  >
                    {item.label}
                  </a>
                ))}
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-md border border-zinc-200 px-3 py-2.5 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-md bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Start your project
                </Link>
              </nav>
            </div>
          )}

          {activeMegaMenu && (
            <motion.div
              initial={{ opacity: 0, x: '-50%', y: -8 }}
              animate={{ opacity: 1, x: '-50%', y: 0 }}
              exit={{ opacity: 0, x: '-50%', y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute left-1/2 top-full hidden w-[min(1180px,calc(100vw-40px))] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(24,24,27,0.16)] md:block"
              onMouseEnter={() => setActiveMenu(activeMenu)}
            >
              <div className="grid grid-cols-[1.05fr_1fr_1.6fr]">
                <div className="space-y-4 p-8">
                  {activeMegaMenu.primary.map((item) => (
                    <a key={item.title} href="#product" className="group grid grid-cols-[54px_1fr] gap-4 rounded-lg p-1">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700">
                        <item.icon size={22} />
                      </span>
                      <span>
                        <span className="block text-base font-semibold text-zinc-950 group-hover:text-blue-700">{item.title}</span>
                        <span className="mt-1 block text-sm leading-5 text-zinc-500">{item.body}</span>
                      </span>
                    </a>
                  ))}
                </div>

                <div className="border-l border-zinc-200 p-8">
                  <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">{activeMegaMenu.modulesTitle}</p>
                  <div className="space-y-5">
                    {activeMegaMenu.modules.map((item) => (
                      <a key={item.title} href="#developers" className="group grid grid-cols-[44px_1fr] gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 group-hover:border-blue-200 group-hover:text-blue-700">
                          <item.icon size={18} />
                        </span>
                        <span>
                          <span className="block text-base font-semibold text-zinc-950 group-hover:text-blue-700">{item.title}</span>
                          <span className="mt-1 block text-sm leading-5 text-zinc-500">{item.body}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-zinc-200 pt-5">
                    <a href="#solutions" className="group grid grid-cols-[44px_1fr] gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 group-hover:border-blue-200 group-hover:text-blue-700">
                        <Sparkles size={18} />
                      </span>
                      <span>
                        <span className="block text-base font-semibold text-zinc-950 group-hover:text-blue-700">{activeMegaMenu.featureTitle}</span>
                        <span className="mt-1 block text-sm leading-5 text-zinc-500">{activeMegaMenu.featureBody}</span>
                      </span>
                    </a>
                  </div>
                </div>

                <div className="border-l border-zinc-200 bg-zinc-50/40 p-8">
                  <a href="#solutions" className="group block">
                    <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                      Customer Stories <ChevronRight className="inline" size={15} />
                    </p>
                    <div className="grid grid-cols-[120px_1fr] gap-5">
                      <div className="flex h-24 items-center justify-center rounded-lg border border-zinc-200 bg-white text-lg font-semibold text-zinc-400">
                        DV.ai
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold leading-7 text-zinc-800 group-hover:text-blue-700">
                          {activeMegaMenu.storyTitle}
                        </h3>
                      </div>
                    </div>
                  </a>

                  <div className="mt-10">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">{activeMegaMenu.compareTitle}</p>
                    <div className="space-y-4">
                      {activeMegaMenu.comparisons.map((item) => (
                        <a key={item} href="#pricing" className="block text-lg font-medium text-zinc-700 hover:text-blue-700">
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <main>
        <section className="border-b border-zinc-200">
          <div className="mx-auto max-w-[1180px] px-5 pb-12 pt-10 md:pb-14 md:pt-14">
            <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-start">
              <Reveal>
                <div>
                  <h1 className="max-w-xl text-balance text-4xl font-semibold leading-[0.98] tracking-tight md:text-6xl">
                    Build product clarity <span className="text-blue-600">from idea to code</span>
                  </h1>
                  <p className="mt-4 max-w-lg text-base leading-7 text-zinc-600">
                    Kavi AI turns discovery, decisions, tasks, code changes, and AI agent work into one traceable
                    product workspace for teams that move fast.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="rounded-md px-4 py-2.5">
                      <Link to="/signup">Start your project</Link>
                    </Button>
                    <Button asChild variant="secondary" className="rounded-md px-4 py-2.5">
                      <Link to="/signup">Request a demo</Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="pt-2 md:pt-20">
                  <p className="max-w-sm text-sm leading-6 text-zinc-600">
                    Start with an idea. Generate specs. Create workflow tasks. Open local projects. Let AI agents propose
                    changes, then approve diffs before anything touches your code.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <div id="product" className="mt-8 grid gap-3 md:grid-cols-3">
                {productTiles.map((tile, index) => (
                  <motion.div
                    key={tile.title}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={`group min-h-[176px] rounded-lg border border-zinc-200 bg-white p-5 ${
                      index === 0 ? 'md:row-span-2 md:min-h-[360px]' : ''
                    }`}
                  >
                    <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 group-hover:border-blue-200 group-hover:text-blue-700">
                      <tile.icon size={17} />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-950">{tile.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{tile.body}</p>
                    {index === 0 && (
                      <div className="mt-10 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                        <div className="mb-3 h-3 w-28 rounded bg-zinc-200" />
                        <div className="space-y-2">
                          {[72, 92, 54, 82].map((width) => (
                            <div key={width} className="h-2 rounded bg-blue-200" style={{ width: `${width}%` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Reveal>

            <p className="mt-7 text-sm font-medium text-zinc-600">Use one workspace for product thinking, agent work, and delivery.</p>
          </div>
        </section>

        {/* <section className="border-b border-zinc-200 bg-zinc-50/50 py-10">
          <div className="mx-auto max-w-[1180px] px-5">
            <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">Trusted by teams building with context</p>
            <div className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5 text-center text-sm font-semibold text-zinc-400 md:grid-cols-4 lg:grid-cols-8">
              {logos.map((logo) => (
                <span key={logo}>{logo}</span>
              ))}
            </div>
          </div>
        </section> */}

        <section className="border-b border-zinc-200 py-20">
          <div className="mx-auto max-w-[1180px] px-5">
            <Reveal>
              <SectionHeader
                eyebrow="Dashboard"
                title="Stay productive and manage your product system without leaving the workspace"
              />
              <MiniDashboard />
            </Reveal>
          </div>
        </section>

        <section id="developers" className="border-b border-zinc-200 py-20">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] md:items-start">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Developers</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Use Kavi AI with your existing stack</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-600">
                  Connect React, FastAPI, Node, Python, Rust, Go, Java, and more. The local workspace indexes code and
                  keeps generated changes reviewable.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <CodePanel />
            </Reveal>
          </div>
        </section>

        <section id="solutions" className="border-b border-zinc-200 bg-zinc-50/40 py-20">
          <div className="mx-auto max-w-[1180px] px-5">
            <SectionHeader
              eyebrow="Templates"
              title="Kickstart your next product workflow with production-ready templates"
              action={
                <a href="#pricing" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-zinc-950">
                  View all scenarios <ArrowRight size={14} />
                </a>
              }
            />
            <div className="landing-carousel flex snap-x gap-4 overflow-x-auto pb-4">
              {templates.map((template) => (
                <motion.div
                  key={template.title}
                  whileHover={{ y: -6 }}
                  className="min-w-[270px] snap-start rounded-lg border border-zinc-200 bg-white p-5 md:min-w-[360px]"
                >
                  <div className="mb-14 flex h-48 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
                    <template.icon size={38} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold">{template.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{template.meta}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-200 py-20">
          <div className="mx-auto max-w-[1180px] px-5">
            <SectionHeader
              eyebrow="Customer Stories"
              title="How product and engineering leaders are building with Kavi AI"
              action={<a className="text-sm font-semibold text-zinc-700 hover:text-zinc-950">More stories</a>}
            />
            <div className="grid gap-2 md:grid-cols-[1fr_80px_80px_80px]">
              {stories.map((story, index) => (
                <motion.div
                  key={story.company}
                  whileHover={{ scale: index === 0 ? 1 : 1.02 }}
                  className={`${story.color} min-h-[110px] rounded-lg p-6 text-white md:min-h-[280px] ${
                    index === 0 ? 'md:col-span-1' : 'flex items-center justify-start md:items-start md:justify-center'
                  }`}
                >
                  {index === 0 ? (
                    <>
                      <div className="mb-16 text-sm font-semibold">{story.company}</div>
                      <p className="max-w-lg text-xl font-medium leading-8">{story.quote}</p>
                    </>
                  ) : (
                    <div className="writing-vertical text-sm font-semibold">{story.company}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-b border-zinc-200 py-20">
          <div className="mx-auto max-w-[1180px] px-5 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Join the community</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
              Discover how teams use Kavi AI to keep product context alive from first idea to production.
            </p>
            <Button asChild variant="secondary" className="mt-5 rounded-md px-4 py-2.5">
              <Link to="/signup">Join early access</Link>
            </Button>
          </div>
          <div className="landing-marquee mt-12 flex gap-4">
            {[...communityCards, ...communityCards].map((card, index) => (
              <div key={`${card}-${index}`} className="min-w-[260px] rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-sm">
                <MessageSquareText size={15} className="mb-4 text-blue-600" />
                <p className="text-sm leading-6 text-zinc-600">{card}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-zinc-200 py-20">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 md:grid-cols-[0.8fr_1fr] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Open source thinking from day one</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600">
                Kavi AI is designed for transparent teams: every decision, generated artifact, command, test, and
                commit can be reviewed and traced.
              </p>
              <Button asChild variant="secondary" className="mt-6 rounded-md px-4 py-2.5">
                <Link to="/signup">View roadmap</Link>
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-10 text-center">
              <motion.div
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="font-mono text-6xl font-semibold tracking-tight text-blue-600 md:text-8xl"
              >
                107.6k
              </motion.div>
              <div className="mt-4 text-sm font-medium text-zinc-500">decisions, tasks, files, and workflow events indexed</div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Build in a weekend, scale with context
          </h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-md px-4 py-2.5">
              <Link to="/signup">Start your project</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-md px-4 py-2.5">
              <Link to="/signup">Request a demo</Link>
            </Button>
          </div>
          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-5 text-xs text-zinc-500">
            {['Private workspaces', 'SOC2-ready controls', 'Approval-gated agents', 'Exportable decision history'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check size={13} className="text-blue-600" />
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-zinc-50 py-14">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 sm:grid-cols-2 md:grid-cols-[1.2fr_repeat(5,1fr)]">
          <div>
            <Logo size={24} />
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-600">
              Product memory, workflow automation, and local engineering agents in one secure workspace.
            </p>
          </div>
          {[
            ['Product', 'Decision Vault', 'Workspace', 'AI Agents', 'Tasks'],
            ['Developers', 'Local CLI', 'Git', 'Diff Viewer', 'API'],
            ['Resources', 'Docs', 'Templates', 'Roadmap', 'Security'],
            ['Company', 'About', 'Careers', 'Contact', 'Privacy'],
            ['Community', 'Discord', 'Changelog', 'Customers', 'Blog'],
          ].map(([title, ...items]) => (
            <div key={title}>
              <div className="mb-3 text-xs font-semibold text-zinc-950">{title}</div>
              <div className="space-y-2">
                {items.map((item) => (
                  <a key={item} className="block text-sm text-zinc-500 hover:text-zinc-950">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-14 flex max-w-[1180px] items-center justify-between border-t border-zinc-200 px-5 pt-6 text-xs text-zinc-400">
          <span>© {new Date().getFullYear()} Kavi AI</span>
          <a href="#top" className="inline-flex items-center gap-1 hover:text-zinc-700">
            Back to top <ChevronRight size={13} />
          </a>
        </div>
      </footer>
    </div>
  )
}
