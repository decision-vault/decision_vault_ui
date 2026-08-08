import React from 'react'
import { Box, Flex, Grid, Heading, Text, Card } from '@radix-ui/themes'

export function DiscoveryAdventureBlock() {
  return (
    <Box className="w-full mt-16 border-t border-zinc-900/60 pt-16 select-none pb-12">
      {/* Title Header */}
      <Flex direction="column" align="center" className="text-center mb-10">
        <Heading
          size="8"
          className="sans-heading font-extrabold tracking-tight text-white mb-2"
        >
          Choose Your <span className="text-[#3b82f6]">Adventure</span>
        </Heading>
        <Text size="2" color="gray" className="max-w-md leading-relaxed mx-auto">
          We build elite software tools for companies and enhance candidates'
          tech skills and job prospects.
        </Text>
      </Flex>

      {/* Grid of Two Adventure Cards */}
      <Grid columns={{ initial: '1', lg: '2' }} gap="6" className="max-w-[840px] mx-auto w-full">
        {/* Card 1: For Developers */}
        <Card
          size="3"
          className="dv-card bg-zinc-950/20 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between"
          style={{ minHeight: '340px' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />
          
          <Flex direction="column" gap="4" className="relative z-10">
            {/* Header copy */}
            <Box>
              <Heading size="6" className="font-extrabold text-white">
                For developers
              </Heading>
              <Text size="2" color="gray" className="mt-2 block leading-relaxed max-w-[280px]">
                DecisionVault helps you hone your developer skills and become GenAI-ready.
              </Text>
            </Box>

            {/* Bullet points */}
            <Flex direction="column" gap="2" className="text-sm font-medium">
              <Flex align="center" gap="2" className="text-zinc-300">
                <span className="text-[#3b82f6] font-bold">+</span>
                <span>Track your skill proficiency</span>
              </Flex>
              <Flex align="center" gap="2" className="text-zinc-300">
                <span className="text-[#3b82f6] font-bold">+</span>
                <span>Prepare for technical interviews</span>
              </Flex>
              <Flex align="center" gap="2" className="text-zinc-300">
                <span className="text-[#3b82f6] font-bold">+</span>
                <span>Learn the latest GenAI skills</span>
              </Flex>
            </Flex>

            {/* Solid Pill Button */}
            <button
              type="button"
              className="mt-2 w-fit rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold px-5 py-2.5 shadow-[0_4px_12px_rgba(59,130,246,0.2)] hover:scale-[1.02] cursor-pointer transition-all duration-300"
            >
              Explore Developer Hub
            </button>
          </Flex>

          {/* Floating UI Screenshot Graphic (Bottom-Right, overlapping edge) */}
          <div
            className="absolute bottom-6 -right-6 w-[200px] h-[210px] bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2 pointer-events-none animate-fadeIn"
            style={{ zIndex: 1, transform: 'rotate(-4deg)' }}
          >
            {/* Browser Header Dots */}
            <Flex gap="1.5" className="border-b border-zinc-800 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
            </Flex>

            {/* Mock code block inside window */}
            <Text size="1" color="gray" className="font-mono text-[9px] block">
              Workspace / Python Dev
            </Text>
            <Box className="bg-zinc-950/60 rounded-lg p-2 flex-1 border border-zinc-800/50 font-mono text-[8px] text-zinc-400">
              <p className="text-blue-400 font-semibold mb-1">class RequirementChecker:</p>
              <p className="pl-2">def __init__(self, data):</p>
              <p className="pl-4">self.data = data</p>
              <p className="pl-2">def is_valid(self) -&gt; bool:</p>
              <p className="pl-4 text-blue-400">return len(self.data) &gt;= 300</p>
            </Box>
          </div>
        </Card>

        {/* Card 2: For Business */}
        <Card
          size="3"
          className="dv-card bg-zinc-950/20 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between"
          style={{ minHeight: '340px' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/5 via-transparent to-transparent opacity-60 pointer-events-none" />
          
          <Flex direction="column" gap="4" className="relative z-10">
            {/* Header copy */}
            <Box>
              <Heading size="6" className="font-extrabold text-white">
                For business
              </Heading>
              <Text size="2" color="gray" className="mt-2 block leading-relaxed max-w-[280px]">
                Get your company GenAI ready.
              </Text>
            </Box>

            {/* Bullet points */}
            <Flex direction="column" gap="2" className="text-sm font-medium">
              <Flex align="center" gap="2" className="text-zinc-300">
                <span className="text-[#3b82f6] font-bold">+</span>
                <span>Attract and hire the right developers</span>
              </Flex>
              <Flex align="center" gap="2" className="text-zinc-300">
                <span className="text-[#3b82f6] font-bold">+</span>
                <span>Upskill your team with the latest GenAI skills</span>
              </Flex>
              <Flex align="center" gap="2" className="text-zinc-300">
                <span className="text-[#3b82f6] font-bold">+</span>
                <span>Build out your AI platform team</span>
              </Flex>
            </Flex>

            {/* Outlined Pill Button */}
            <button
              type="button"
              className="mt-2 w-fit rounded-xl border border-zinc-700 bg-transparent hover:bg-zinc-900/60 text-zinc-300 hover:text-white text-xs font-bold px-5 py-2.5 cursor-pointer transition-all duration-300"
            >
              Explore Enterprise Solutions
            </button>
          </Flex>

          {/* Floating UI Elements: GenAI Icon Badge & 3D Glass SVG Cube (Bottom-Right) */}
          <div className="absolute bottom-6 right-6 w-[180px] h-[190px] pointer-events-none flex flex-col justify-between items-end">
            {/* Floating GenAI Pill Badge */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl px-5 py-3 text-white font-extrabold text-sm tracking-wide shadow-2xl animate-floaty filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              GenAI
            </div>

            {/* 3D Glass Isometric Cube SVG */}
            <div className="w-28 h-28 opacity-80 filter drop-shadow-[0_5px_15px_rgba(59,130,246,0.15)] animate-floaty" style={{ animationDelay: '2s' }}>
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                {/* Isometric Cube Faces with translucent gradient glassmorphism */}
                {/* Left Face */}
                <polygon
                  points="10,50 50,70 50,95 10,75"
                  fill="url(#leftGrad)"
                  stroke="#3b82f6"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />
                {/* Right Face */}
                <polygon
                  points="50,70 90,50 90,75 50,95"
                  fill="url(#rightGrad)"
                  stroke="#3b82f6"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />
                {/* Top Face */}
                <polygon
                  points="50,20 90,40 50,60 10,40"
                  fill="url(#topGrad)"
                  stroke="#818cf8"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                />

                {/* Gradients */}
                <defs>
                  <linearGradient id="leftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="rightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </Card>
      </Grid>
    </Box>
  )
}
