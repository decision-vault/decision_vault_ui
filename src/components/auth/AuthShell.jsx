import { Link } from 'react-router-dom'
import { Avatar, Box, Flex, Grid, Heading, Link as RadixLink, Text } from '@radix-ui/themes'

export function AuthShell({
  title,
  subtitle,
  children,
  bottom,
  right,
  topRightHref = '/docs',
  topRightLabel = 'Documentation',
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
                style={{
                  width: 24,
                  height: 24,
                  background: 'var(--accent-9)',
                  borderRadius: 6,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }}
              />
              <Text size="4" weight="bold">
                supabase
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

      <Box style={{ position: 'absolute', top: 24, right: 24 }}>
        <RadixLink asChild size="2" color="gray">
          <Link to={topRightHref}>{topRightLabel}</Link>
        </RadixLink>
      </Box>
    </Box>
  )
}

function DefaultTestimonial() {
  return (
    <Flex direction="column" gap="4" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Text size="8" style={{ opacity: 0.3 }}>
        &ldquo;
      </Text>
      <Heading size="6">Where has @supabase been all my life? 😍</Heading>
      <Flex align="center" gap="2">
        <Avatar size="2" radius="full" fallback="E" />
        <Text size="2">@Elsolo244</Text>
      </Flex>
    </Flex>
  )
}
