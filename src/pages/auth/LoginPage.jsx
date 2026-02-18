import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Button,
  TextField,
  Separator,
  Link as RadixLink,
  Badge,
  Avatar,
  IconButton,
} from '@radix-ui/themes'
import { EyeOpenIcon, EyeClosedIcon, GitHubLogoIcon, LockClosedIcon } from '@radix-ui/react-icons'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Grid
        columns={{ initial: '1fr', md: '0.75fr 1.25fr' }}
        style={{ flex: 1, minHeight: '100vh' }}
      >
        {/* Left: Form */}
        <Flex
          direction="column"
          justify="center"
          align="center"
          p="6"
          style={{ maxWidth: 480, margin: '0 auto', width: '100%', minWidth: 0 }}
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
              <Heading size="8">Welcome back</Heading>
              <Text size="2" color="gray">
                Sign in to your account
              </Text>
            </Flex>

            <Flex direction="column" gap="3">
              <Button variant="surface" size="3" style={{ width: '100%' }}>
                <Flex align="center" gap="2" style={{ flex: 1 }}>
                  <GitHubLogoIcon width="18" height="18" />
                  Continue with GitHub
                </Flex>
                <Badge size="1" color="green">
                  LAST USED
                </Badge>
              </Button>
              <Button variant="surface" size="3" style={{ width: '100%' }}>
                <LockClosedIcon width="18" height="18" />
                Continue with SSO
              </Button>
            </Flex>

            <Flex align="center" gap="3">
              <Separator size="4" />
              <Text size="1" color="gray">
                or
              </Text>
              <Separator size="4" />
            </Flex>

            <Flex direction="column" gap="3">
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">
                  Email
                </Text>
                <TextField.Root
                  type="email"
                  placeholder="you@example.com"
                  size="3"
                  variant="surface"
                />
              </Flex>
              <Flex direction="column" gap="1">
                <Flex justify="between" align="center">
                  <Text as="label" size="2" weight="medium">
                    Password
                  </Text>
                  <RadixLink asChild size="1" color="gray">
                    <Link to="/forgot-password">Forgot password?</Link>
                  </RadixLink>
                </Flex>
                <TextField.Root
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  size="3"
                  variant="surface"
                >
                  <TextField.Slot side="right">
                    <IconButton
                      variant="ghost"
                      size="1"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeClosedIcon width="16" height="16" />
                      ) : (
                        <EyeOpenIcon width="16" height="16" />
                      )}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </Flex>
              <Button size="3" color="green" style={{ width: '100%' }} asChild>
                <Link to="/organizations">Sign in</Link>
              </Button>
            </Flex>

            <Text size="2" color="gray">
              Don&apos;t have an account?{' '}
              <RadixLink asChild>
                <Link to="/signup">Sign up</Link>
              </RadixLink>
            </Text>

            <Text size="1" color="gray" style={{ marginTop: 'auto' }}>
              By continuing, you agree to Supabase&apos;s{' '}
              <RadixLink asChild>
                <Link to="/terms">Terms of Service</Link>
              </RadixLink>{' '}
              and{' '}
              <RadixLink asChild>
                <Link to="/privacy">Privacy Policy</Link>
              </RadixLink>
              , and to receive periodic emails with updates.
            </Text>
          </Flex>
        </Flex>

        {/* Right: Testimonial */}
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
          <Flex direction="column" gap="4" style={{ maxWidth: 400 }}>
            <Text size="8" style={{ opacity: 0.3 }}>
              &ldquo;
            </Text>
            <Heading size="6">
              Where has @supabase been all my life? 😍
            </Heading>
            <Flex align="center" gap="2">
              <Avatar
                size="2"
                radius="full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                fallback="E"
              />
              <Text size="2">@Elsolo244</Text>
            </Flex>
          </Flex>
        </Flex>
      </Grid>

      {/* Top right: Documentation link */}
      <Box
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
        }}
      >
        <RadixLink asChild size="2" color="gray">
          <Link to="/docs">
            <Flex align="center" gap="2">
              <Text size="2">Documentation</Text>
            </Flex>
          </Link>
        </RadixLink>
      </Box>
    </Box>
  )
}
