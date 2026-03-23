import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Flex, Heading, Text, TextArea, TextField } from '@radix-ui/themes'
import { ArrowLeftIcon, CalendarIcon, LockClosedIcon } from '@radix-ui/react-icons'

import { submitDemoRequest } from '../../services/demoApi'
import { Logo } from './components/Logo'

export function BookDemoPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [timezone, setTimezone] = useState('')
  const [notes, setNotes] = useState('')
  const [website, setWebsite] = useState('')

  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('sending')
    try {
      const payload = {
        name,
        email,
        company,
        role: role.trim() || null,
        team_size: teamSize ? Number(teamSize) : null,
        preferred_time: preferredTime.trim() || null,
        timezone: timezone.trim() || null,
        notes: notes.trim() || null,
        website: website.trim() || null,
      }
      await submitDemoRequest(payload)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to submit demo request')
    }
  }

  return (
    <Box className="relative min-h-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0 dv-grid opacity-[0.22]" />
      <div className="pointer-events-none absolute inset-0 dv-noise" />
      <div className="pointer-events-none absolute -top-28 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/30 via-cyan-400/20 to-emerald-400/20 blur-3xl" />

      <Box className="relative mx-auto w-full max-w-[980px] px-6 py-10">
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Flex align="center" gap="3">
            <Button asChild variant="soft" size="2">
              <Link to="/">
                <ArrowLeftIcon width="16" height="16" /> Back
              </Link>
            </Button>
            <Logo size={26} />
          </Flex>
          <Flex align="center" gap="2" className="dv-muted">
            <LockClosedIcon width="14" height="14" />
            <Text size="2">We only use this to schedule your demo.</Text>
          </Flex>
        </Flex>

        <Flex className="mt-10" direction={{ initial: 'column', md: 'row' }} gap="6" align="stretch">
          <Box className="dv-card p-7" style={{ flex: 1 }}>
            <Heading size="7">Book a demo</Heading>
            <Text size="2" color="gray" style={{ display: 'block', marginTop: 10 }}>
              Tell us a bit about your team. We’ll follow up to schedule a quick walkthrough.
            </Text>

            {status === 'sent' ? (
              <Box className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
                <Flex align="center" gap="2">
                  <CalendarIcon width="16" height="16" />
                  <Text size="3" weight="medium">
                    Request received
                  </Text>
                </Flex>
                <Text size="2" color="gray" style={{ display: 'block', marginTop: 8 }}>
                  We’ll email you shortly with next steps.
                </Text>
              </Box>
            ) : (
              <form onSubmit={onSubmit} className="mt-6">
                <Flex direction="column" gap="4">
                  <Flex direction={{ initial: 'column', sm: 'row' }} gap="3">
                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="medium">
                        Name
                      </Text>
                      <TextField.Root
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        size="3"
                        required
                        mt="1"
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="medium">
                        Work email
                      </Text>
                      <TextField.Root
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        size="3"
                        required
                        mt="1"
                      />
                    </Box>
                  </Flex>

                  <Flex direction={{ initial: 'column', sm: 'row' }} gap="3">
                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="medium">
                        Company
                      </Text>
                      <TextField.Root
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme, Inc."
                        size="3"
                        required
                        mt="1"
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="medium">
                        Role (optional)
                      </Text>
                      <TextField.Root
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="CTO, PM, Engineering Lead..."
                        size="3"
                        mt="1"
                      />
                    </Box>
                  </Flex>

                  <Flex direction={{ initial: 'column', sm: 'row' }} gap="3">
                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="medium">
                        Team size (optional)
                      </Text>
                      <TextField.Root
                        type="number"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        placeholder="25"
                        size="3"
                        mt="1"
                        min="1"
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="medium">
                        Preferred time (optional)
                      </Text>
                      <TextField.Root
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        placeholder="Next week, mornings..."
                        size="3"
                        mt="1"
                      />
                    </Box>
                  </Flex>

                  <Box>
                    <Text as="label" size="2" weight="medium">
                      Timezone (optional)
                    </Text>
                    <TextField.Root
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="America/Los_Angeles"
                      size="3"
                      mt="1"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" weight="medium">
                      Notes (optional)
                    </Text>
                    <TextArea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What are you trying to solve? Slack capture, audit trails, onboarding..."
                      size="3"
                      style={{ minHeight: 110 }}
                      mt="1"
                    />
                  </Box>

                  <Box style={{ display: 'none' }}>
                    <Text as="label" size="2" weight="medium">
                      Website
                    </Text>
                    <TextField.Root value={website} onChange={(e) => setWebsite(e.target.value)} size="3" mt="1" />
                  </Box>

                  {error ? (
                    <Text size="2" color="red">
                      {error}
                    </Text>
                  ) : null}

                  <Button size="3" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Submitting…' : 'Request demo'}
                  </Button>
                </Flex>
              </form>
            )}
          </Box>

          <Box className="dv-card p-7" style={{ width: '100%', maxWidth: 360 }}>
            <Heading size="5">What you’ll get</Heading>
            <Box className="mt-4">
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-white/70">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
                  <span>15 minute walkthrough tailored to your workflow.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-300/80" />
                  <span>Recommended capture + taxonomy setup for your teams.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                  <span>Security and data boundaries discussion (tenant, projects, roles).</span>
                </li>
              </ul>
            </Box>

            <Box className="mt-6 rounded-2xl border border-zinc-200/70 bg-white/70 p-4 text-sm text-zinc-700 dark:border-white/10 dark:bg-black/20 dark:text-white/75">
              <Text size="1" color="gray" style={{ display: 'block' }}>
                Tip
              </Text>
              <Text size="2" style={{ display: 'block', marginTop: 6 }}>
                Include 1–2 example “why did we…?” questions you wish your team could answer instantly.
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

