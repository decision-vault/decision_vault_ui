import React from 'react';
import { Box, Flex, Heading, Text, Button } from '@radix-ui/themes';
import { GitHubLogoIcon, TriangleDownIcon, ExternalLinkIcon } from '@radix-ui/react-icons';

export default function IntegrationsPage() {
  return (
    <Box style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }} px="4" py="2">
      {/* ================= HEADER SECTION ================= */}
      <Box mb="6">
        <Heading size="6" weight="normal" mb="1" style={{ color: 'var(--gray-12)' }}>
          Integrations
        </Heading>
        <Text size="3" style={{ color: 'var(--gray-10)' }}>
          Connect external services to your organization
        </Text>
      </Box>

      {/* ================= INTEGRATIONS LIST ================= */}
      <Flex direction="column" gap="6">
        
        {/* ------ GITHUB INTEGRATION BLOCK ------ */}
        <Box>
          <Flex gap="4" align="start" mb="4">
            {/* Logo Container */}
            <Flex
              align="center"
              justify="center"
              style={{
                width: '48px',
                height: '48px',
                border: '1px solid var(--gray-4)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-panel-solid)',
                flexShrink: 0
              }}
            >
              {/*  FIXED: Using Radix native GitHub icon */}
              <GitHubLogoIcon width="24" height="24" style={{ color: 'var(--gray-12)' }} />
            </Flex>

            {/* Content Details */}
            <Flex direction="column" gap="1">
              <Heading size="4" weight="bold" style={{ color: 'var(--gray-12)' }}>
                GitHub
              </Heading>
              <Text size="2" style={{ color: 'var(--gray-11)', lineHeight: '1.5' }}>
                Connect GitHub repositories to DecisionVault projects in this organization. The DecisionVault GitHub app watches file, branch, and pull request activity in each connected repository.
              </Text>
            </Flex>
          </Flex>

          {/* Dotted Connection Area */}
          <Box
            className="w-full flex justify-center align-center"
            style={{
              border: '1px dashed var(--gray-5)',
              borderRadius: '8px',
              padding: '24px',
              backgroundColor: 'var(--gray-1)'
            }}
          >
            <Button 
              variant="outline" 
              color="gray" 
              size="2" 
              radius="md"
              style={{ backgroundColor: 'var(--color-panel-solid)', cursor: 'pointer', fontWeight: '500' }}
            >
              Add new project connection
            </Button>
          </Box>
        </Box>

        {/* ------ VERCEL INTEGRATION BLOCK ------ */}
        <Box>
          <Flex gap="4" align="start" mb="4">
            {/* Logo Container */}
            <Flex
              align="center"
              justify="center"
              style={{
                width: '48px',
                height: '48px',
                border: '1px solid var(--gray-4)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-panel-solid)',
                flexShrink: 0
              }}
            >
              {/*  FIXED: Custom crisp CSS Triangle matching Vercel's geometry perfectly */}
              <div 
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: '18px solid var(--gray-12)',
                  transform: 'translateY(-1px)'
                }} 
              />
            </Flex>

            {/* Content Details */}
            <Flex direction="column" gap="1">
              <Heading size="4" weight="bold" style={{ color: 'var(--gray-12)' }}>
                Vercel
              </Heading>
              <Text size="2" style={{ color: 'var(--gray-11)', lineHeight: '1.5' }}>
                Connect your Vercel teams to this DecisionVault organization. DecisionVault keeps environment variables up to date in each connected project. You can also link multiple Vercel projects to the same DecisionVault project.
              </Text>
            </Flex>
          </Flex>

          {/* Dotted Connection Area */}
          <Box
            className="w-full flex justify-center align-center"
            style={{
              border: '1px dashed var(--gray-5)',
              borderRadius: '8px',
              padding: '24px',
              backgroundColor: 'var(--gray-1)'
            }}
          >
            <Button 
              variant="outline" 
              color="gray" 
              size="2" 
              radius="md"
              style={{ backgroundColor: 'var(--color-panel-solid)', cursor: 'pointer', fontWeight: '500' }}
            >
              {/*  FIXED: Using Radix native External Link icon */}
              <ExternalLinkIcon width="14" height="14" />
              Install Vercel integration
            </Button>
          </Box>
        </Box>

      </Flex>
    </Box>
  );
}