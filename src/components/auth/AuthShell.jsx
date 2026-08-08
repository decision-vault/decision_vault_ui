import { Link } from 'react-router-dom'
import { Avatar, Box, Flex, Grid, Heading, Link as RadixLink, Text } from '@radix-ui/themes'
import logo from '../../assets/logo.svg'

export function AuthShell({
  title,
  subtitle,
  children,
  bottom,
  right,
}) {
  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Grid columns={{ initial: '1fr', md: '0.75fr 1.25fr' }} style={{ flex: 1, minHeight: '100vh' }}>
        <Flex
          direction="column"
          justify="center"
          align="center"
          p="6"
          style={{ maxWidth: 520, margin: '0 auto', width: '100%', minWidth: 0 }}
        >
          <Flex direction="column" gap="6" style={{ width: '100%' }}>
            <Flex align="center" gap="2">
              <Box
                asChild
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <img src={logo} alt="DecisionVault logo" />
              </Box>
              <Text size="4" weight="bold">
                DecisionVault
              </Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Heading size="8">{title}</Heading>
              {subtitle ? (
                <Text size="2" color="gray">
                  {subtitle}
                </Text>
              ) : null}
            </Flex>

            {children}

            {bottom ? bottom : null}
          </Flex>
        </Flex>

        <Flex
          direction="column"
          justify="center"
          align="center"
          p="8"
          style={{
            background: 'var(--color-panel-translucent)',
            borderLeft: '1px solid var(--gray-6)',
          }}
        >
          <Box style={{ width: '100%' }}>{right ?? <DefaultTestimonial />}</Box>
        </Flex>
      </Grid>
    </Box>
  )
}

function DefaultTestimonial() {
  return (
    <Flex direction="column" gap="4" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Text size="8" style={{ opacity: 0.3 }}>
        &ldquo;
      </Text>
      <Heading size="6">Make every product decision traceable, searchable, and explainable.</Heading>
      <Flex align="center" gap="2">
        <Avatar size="2" radius="full" fallback="DV" />
        <Text size="2">DecisionVault Team</Text>
      </Flex>
    </Flex>
  )
}
