import React from 'react'
import { Box, Heading, Text, Flex } from '@radix-ui/themes'
import logo from '../../../assets/logo.png'
export function DiscoveryHero() {
  return (
    <Box className="w-full text-center mb-8">
      {/* Centered Logo and Brand */}
      <Flex direction="column" align="center" justify="center" className="mb-4 select-none animate-fadeIn">
        <Box className="w-12 h-12 mb-2 flex items-center justify-center">
          <img src={logo} alt="DecisionVault logo" className="w-40 h-40 object-contain" />
        </Box>
        <Text size="3" weight="bold" className="text-white tracking-wider uppercase text-xs">
          DecisionVault
        </Text>
      </Flex>

      {/* Centered Heading */}
      <Heading
        size="8"
        className="font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-2"
        style={{ lineHeight: 1.15 }}
      >
        What are you building today?
      </Heading>
      
      {/* Centered Subtitle */}
      <Text size="3" color="gray" className="mx-auto block max-w-xl leading-relaxed">
        Describe your product idea and DecisionVault will help generate requirements,
        architecture, PRDs, and execution plans.
      </Text>
    </Box>
  )
}
