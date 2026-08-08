import React from 'react'
import { Grid, Text, Box, Flex } from '@radix-ui/themes'
import { motion } from 'framer-motion'

const PRODUCT_TYPES = [
  {
    id: 'saas',
    label: 'SaaS Platform',
    desc: 'Multi-tenant cloud services, dashboards, and subscription frameworks.',
    bgGrad: 'from-blue-600/10 via-blue-900/5 to-transparent',
    iconColor: 'text-blue-400 group-hover:text-blue-300',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/15 border-blue-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    id: 'erp',
    label: 'Enterprise ERP',
    desc: 'Operational controls, resources, logistics, and database ledgers.',
    bgGrad: 'from-purple-600/10 via-purple-900/5 to-transparent',
    iconColor: 'text-purple-400 group-hover:text-purple-300',
    iconBg: 'bg-purple-500/10 group-hover:bg-purple-500/15 border-purple-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    id: 'crm',
    label: 'CRM Hub',
    desc: 'Customer relations, deal pipelines, customer logs, and ticketing.',
    bgGrad: 'from-blue-600/10 via-blue-900/5 to-transparent',
    iconColor: 'text-blue-400 group-hover:text-blue-300',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/15 border-blue-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    desc: 'Multi-vendor trading networks, cart checkouts, and catalog searches.',
    bgGrad: 'from-amber-600/10 via-amber-900/5 to-transparent',
    iconColor: 'text-amber-400 group-hover:text-amber-300',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/15 border-amber-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  {
    id: 'ai_tool',
    label: 'AI Agent / Tool',
    desc: 'Autonomous LLM chains, semantic engines, and diagnostic logic.',
    bgGrad: 'from-blue-600/10 via-blue-900/5 to-transparent',
    iconColor: 'text-blue-400 group-hover:text-blue-300',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/15 border-blue-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  {
    id: 'dev_tool',
    label: 'Developer Tool',
    desc: 'CLIs, SDKs, webhook pipelines, and system configuration profiles.',
    bgGrad: 'from-rose-600/10 via-rose-900/5 to-transparent',
    iconColor: 'text-rose-400 group-hover:text-rose-300',
    iconBg: 'bg-rose-500/10 group-hover:bg-rose-500/15 border-rose-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    id: 'fintech',
    label: 'FinTech App',
    desc: 'P2P wallets, asset charts, Stripe checkouts, and micro-ledgers.',
    bgGrad: 'from-blue-600/10 via-blue-900/5 to-transparent',
    iconColor: 'text-blue-400 group-hover:text-blue-300',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/15 border-blue-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'healthcare',
    label: 'Healthcare Portal',
    desc: 'Patient consultation schedules, secure health files, and vital logs.',
    bgGrad: 'from-red-600/10 via-red-900/5 to-transparent',
    iconColor: 'text-red-400 group-hover:text-red-300',
    iconBg: 'bg-red-500/10 group-hover:bg-red-500/15 border-red-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  {
    id: 'education',
    label: 'EdTech Classroom',
    desc: 'Course calendars, student classrooms, and interactive lesson portals.',
    bgGrad: 'from-violet-600/10 via-violet-900/5 to-transparent',
    iconColor: 'text-violet-400 group-hover:text-violet-300',
    iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/15 border-violet-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    )
  },
  {
    id: 'analytics',
    label: 'Analytics Board',
    desc: 'Real-time charts, metrics dashboards, and notification hubs.',
    bgGrad: 'from-sky-600/10 via-sky-900/5 to-transparent',
    iconColor: 'text-sky-400 group-hover:text-sky-300',
    iconBg: 'bg-sky-500/10 group-hover:bg-sky-500/15 border-sky-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: 'internal_tool',
    label: 'Internal Portal',
    desc: 'Configuration audits, user logs, and private workspace admin panels.',
    bgGrad: 'from-zinc-600/10 via-zinc-900/5 to-transparent',
    iconColor: 'text-zinc-400 group-hover:text-zinc-300',
    iconBg: 'bg-zinc-800/10 group-hover:bg-zinc-800/15 border-zinc-700/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce Shop',
    desc: 'Web storefronts, shopping cart workflows, and shipping logs.',
    bgGrad: 'from-amber-600/10 via-yellow-900/5 to-transparent',
    iconColor: 'text-amber-400 group-hover:text-amber-300',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/15 border-amber-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
]

export function ProductTypeSelector({ selectedTypes, onToggleType }) {
  // Stagger container definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <Box className="w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
          {PRODUCT_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type.id)
            return (
              <motion.div
                key={type.id}
                variants={cardVariants}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggleType(type.id)}
                className={`group relative border rounded-2xl p-5 min-h-[145px] cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/20 shadow-[0_0_25px_rgba(59,130,246,0.12)]'
                    : 'border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:bg-zinc-50 dark:hover:bg-zinc-950/50'
                }`}
              >
                {/* Background radial gradient glow matching type color */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${type.bgGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  style={{ mixBlendMode: 'plus-lighter' }}
                />

                {/* Floating Top Right Check/Plus Badge */}
                {isSelected ? (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-scaleIn">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-zinc-400 dark:group-hover:border-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                )}

                {/* Main Content Layout */}
                <Flex direction="column" gap="4" className="relative z-10 h-full justify-between">
                  {/* Icon housing */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                        : `bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 ${type.iconColor} ${type.iconBg}`
                    }`}
                  >
                    {type.icon}
                  </div>

                  {/* Title and description */}
                  <Box className="mt-1">
                    <Text
                      size="3"
                      weight="bold"
                      className={`block transition-colors duration-300 ${
                        isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white'
                      }`}
                    >
                      {type.label}
                    </Text>
                    <Text
                      size="1"
                      className={`leading-relaxed block mt-1.5 ${
                        isSelected ? 'text-blue-900/80 dark:text-zinc-300' : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {type.desc}
                    </Text>
                  </Box>
                </Flex>
              </motion.div>
            )
          })}
        </Grid>
      </motion.div>
    </Box>
  )
}
