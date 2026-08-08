import React, { useState } from 'react'
import { Box, Flex, Text, IconButton } from '@radix-ui/themes'
import { motion, AnimatePresence } from 'framer-motion'

const FEATURE_CATEGORIES = [
  {
    id: 'auth',
    title: 'Authentication & Access',
    desc: 'Identity providers, multi-factor setups, and secure token checks.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.02 5.912L9 17.55V19.5h-1.5v-1.5H6v-1.5H4.5v-1.5H3V12l5.44-5.44A6 6 0 0115.75 5.25z" />
      </svg>
    ),
    features: [
      { id: 'oauth', label: 'OAuth Single Sign-on' },
      { id: 'mfa', label: 'Multi-Factor Auth (MFA)' },
      { id: 'magic_link', label: 'Passwordless Magic Link' },
      { id: 'rbac', label: 'Role-Based Access (RBAC)' }
    ]
  },
  {
    id: 'collab',
    title: 'Collaboration & Communication',
    desc: 'Real-time sync boards, notification alerts, and comments.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m0 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 005.03 12c0-.225.012-.447.037-.666A11.944 11.944 0 0112 3c2.17 0 4.207.576 5.963 1.584A6.062 6.062 0 0118 5.281m0 0a5.971 5.971 0 00.941 3.197m0 0a5.995 5.995 0 00-.94 3.522m-9.75-3.522a3 3 0 100-6 3 3 0 000 6zm7.5 0a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    ),
    features: [
      { id: 'comments', label: 'Real-Time Mentions & Comments' },
      { id: 'canvas', label: 'Shared Kanban Canvas' },
      { id: 'invites', label: 'Email Team Invitations' },
      { id: 'slack', label: 'Slack Webhook Alerts' }
    ]
  },
  {
    id: 'ai',
    title: 'AI / Cognitive Features',
    desc: 'Semantic data filters, LLM analytics, and code generation.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0-5.904l-.813 5.096M6.25 8.357a3.5 3.5 0 117 0v2.93m-7-2.93a3.5 3.5 0 107 0v2.93m-7 0H14m-7.75 3.75h8.5M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    features: [
      { id: 'semantic', label: 'Semantic Database Search' },
      { id: 'snippets', label: 'Automated Code Generation' },
      { id: 'llm_logs', label: 'LLM Audit & Analytics' },
      { id: 'diagnostic', label: 'Diagnostic Pipeline Probes' }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Subscriptions',
    desc: 'Stripe checkouts, billing tiers, and accounting charts.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    features: [
      { id: 'stripe', label: 'Stripe Checkout integrations' },
      { id: 'tiers', label: 'Multi-Tier Subscriptions' },
      { id: 'ledger', label: 'Automated Invoicing & Ledgers' }
    ]
  },
  {
    id: 'admin',
    title: 'Workspace Management',
    desc: 'Audit panels, security rules, and license logs.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    features: [
      { id: 'audit_logs', label: 'Global Operations Audit Logs' },
      { id: 'locks', label: 'Tenant Configuration Locks' },
      { id: 'licenses', label: 'License Verification Banners' }
    ]
  }
]

export function FeatureSelector({ selectedFeatures, onToggleFeature }) {
  // Store expanded state per category
  const [expanded, setExpanded] = useState({
    auth: true,
    collab: true,
    ai: false,
    payments: false,
    admin: false
  })

  const toggleCategory = (catId) => {
    setExpanded((prev) => ({ ...prev, [catId]: !prev[catId] }))
  }

  return (
    <Box className="w-full">
      <Flex direction="column" gap="4">
        {FEATURE_CATEGORIES.map((cat) => {
          const isOpen = expanded[cat.id]
          const selectedInCat = cat.features.filter((f) => selectedFeatures.includes(f.id)).length

          return (
            <div
              key={cat.id}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen
                  ? 'border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 shadow-soft'
                  : 'border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/10 hover:border-zinc-300 dark:hover:border-zinc-800'
              }`}
            >
              {/* Category Header */}
              <Flex
                align="center"
                justify="between"
                px="4"
                py="4"
                className="cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/10"
                onClick={() => toggleCategory(cat.id)}
              >
                <Flex align="center" gap="3.5" className="flex-1 min-w-0 pr-4">
                  {/* Icon Housing */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      isOpen
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                        : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Flex align="center" gap="2.5">
                      <Text size="3" weight="bold" className="text-zinc-800 dark:text-zinc-200 truncate">
                        {cat.title}
                      </Text>
                      {selectedInCat > 0 && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 rounded-full font-bold">
                          {selectedInCat} selected
                        </span>
                      )}
                    </Flex>
                    <Text size="1" className="text-zinc-400 dark:text-zinc-500 truncate block mt-0.5 leading-normal">
                      {cat.desc}
                    </Text>
                  </div>
                </Flex>

                <IconButton
                  variant="ghost"
                  color="gray"
                  size="2"
                  className="rounded-full text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {isOpen ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                </IconButton>
              </Flex>

              {/* Collapsible Content using framer-motion */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-5 pt-2 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/20">
                      <Flex wrap="wrap" gap="2.5" className="mt-1">
                        {cat.features.map((feat) => {
                          const isSelected = selectedFeatures.includes(feat.id)
                          return (
                            <motion.div
                              key={feat.id}
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => onToggleFeature(feat.id)}
                              className={`cursor-pointer select-none rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border transition-all duration-300 ${
                                isSelected
                                  ? 'bg-blue-50/80 border-blue-600 text-blue-700 dark:bg-blue-950/20 dark:border-blue-500/70 dark:text-blue-300 shadow-[0_2px_8px_rgba(59,130,246,0.1)]'
                                  : 'bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900/60 dark:border-zinc-800/80 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
                              }`}
                            >
                              {isSelected ? (
                                <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                              )}
                              <span>{feat.label}</span>
                            </motion.div>
                          )
                        })}
                      </Flex>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </Flex>
    </Box>
  )
}
