import React from 'react'
import { Box, Flex, Grid, Heading, Text, Card, Avatar } from '@radix-ui/themes'
import orchestraImg from '../../../assets/orchestra_stage.png'
import adaImg from '../../../assets/ada_portrait.png'

export function DiscoveryMarketingBlock() {
  const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Outfit:wght@400;700;800&display=swap');
    
    .cursive-text {
      font-family: 'Caveat', cursive;
      color: #3b82f6;
      display: inline-block;
      position: relative;
    }
    
    .cursive-text::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      width: 100%;
      height: 4px;
      background: radial-gradient(circle, #3b82f6 20%, transparent 60%);
      opacity: 0.7;
    }
    
    .sans-heading {
      font-family: 'Outfit', sans-serif;
    }
  `

  return (
    <Box className="w-full mt-12 border-t border-zinc-900/60 pt-12 select-none">
      <style>{fontStyle}</style>

      {/* Hero Header Section */}
      <Flex direction="column" align="center" className="text-center mb-16 relative">
        <div className="relative inline-block">
          <Heading
            size="9"
            className="sans-heading font-extrabold tracking-tight text-white"
            style={{ fontSize: '3.5rem', lineHeight: 1.1 }}
          >
            AI Changing Software
          </Heading>
          
          {/* Blue Sparkle Star Icon positioned next to Software */}
          <div className="absolute -top-2 -right-12 text-[#3b82f6] animate-floaty filter drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L15.3 8.7L23 12L15.3 15.3L12 23L8.7 15.3L1 12L8.7 8.7L12 1Z" />
            </svg>
          </div>
        </div>

        <Heading
          size="9"
          className="cursive-text text-5xl mt-2 tracking-wide font-normal animate-pulse"
          style={{ fontSize: '3.8rem', animationDuration: '4s' }}
        >
          Development
        </Heading>
      </Flex>

      {/* Two-Column Detail Grid */}
      <Grid columns={{ initial: '1', md: '12' }} gap="6" className="items-center max-w-[720px] mx-auto pb-12">
        {/* Left Side (GenAI text) */}
        <Box className="md:col-span-5 flex flex-col justify-center text-left pr-4">
          <Heading size="6" className="sans-heading font-extrabold text-white leading-tight">
            <span className="text-[#3b82f6]">GenAI</span><br />
            advances daily
          </Heading>
          <Text size="2" color="gray" className="mt-3 block leading-relaxed max-w-[200px]">
            AI's ability to write code is evolving at a dizzying pace.
          </Text>
        </Box>

        {/* Right Side (Orchestra image card with Ada overlay) */}
        <Box className="md:col-span-7 relative pt-4 pb-6 px-4">
          {/* Main Stage card */}
          <div
            className="w-full h-[220px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative"
            style={{
              backgroundImage: `url(${orchestraImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark overlay screen */}
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Ada profile card overlap (floating bottom-left) */}
          <Card
            size="2"
            className="absolute -bottom-2 -left-6 w-[230px] bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3 animate-fadeIn"
            style={{ zIndex: 5 }}
          >
            <Flex align="center" gap="3">
              <Avatar
                size="2"
                radius="full"
                fallback="A"
                src={adaImg}
                className="border border-zinc-800 shadow"
              />
              <Flex direction="column" gap="0">
                <Text size="2" weight="bold" className="text-white">
                  Ada
                </Text>
                <Text size="1" color="gray" className="text-[10px] truncate max-w-[140px]">
                  Machine Learning Engineer
                </Text>
              </Flex>
            </Flex>

            <Box className="border-t border-zinc-900/60 pt-2.5">
              <Text size="1" color="gray" className="uppercase tracking-widest text-[9px] font-semibold text-zinc-500">
                Certifications
              </Text>
              <Flex direction="column" gap="1" className="mt-1.5">
                <Flex align="center" gap="1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                  <Text size="1" color="gray" className="text-[10px] text-zinc-300">
                    TensorFlow Certified Developer
                  </Text>
                </Flex>
                <Flex align="center" gap="1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                  <Text size="1" color="gray" className="text-[10px] text-zinc-300">
                    Google Cloud ML Engineer
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </Card>
        </Box>
      </Grid>
    </Box>
  )
}
