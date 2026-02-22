import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Card,
  Link as RadixLink,
  Select,
} from '@radix-ui/themes'
import { createOrganization } from '../../services/orgApi'

export function OrgCreatePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const created = await createOrganization({ name })
      navigate(`/organizations/${created.id}/projects`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box p="6" style={{ maxWidth: 560, margin: '0 auto' }}>
      <Card variant="surface" size="2">
        <Flex direction="column" gap="4" p="5" asChild>
          <form onSubmit={onSubmit}>
            <Flex direction="column" gap="1">
              <Heading size="5">Create a new organization</Heading>
              <Text size="2" color="gray">
                Organizations are a way to group your projects. Each organization can be
                configured with different team members and billing settings.
              </Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Name
              </Text>
              <TextField.Root
                placeholder="Organization name"
                size="2"
                variant="surface"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <Text size="1" color="gray">
                What&apos;s the name of your company or team? You can change this later.
              </Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Type
              </Text>
              <Select.Root defaultValue="personal" size="2">
                <Select.Trigger variant="surface" style={{ width: '100%' }} />
                <Select.Content>
                  <Select.Item value="personal">Personal</Select.Item>
                  <Select.Item value="team">Team</Select.Item>
                  <Select.Item value="enterprise">Enterprise</Select.Item>
                </Select.Content>
              </Select.Root>
              <Text size="1" color="gray">
                What best describes your organization?
              </Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Plan
              </Text>
              <Select.Root defaultValue="free" size="2">
                <Select.Trigger variant="surface" style={{ width: '100%' }} />
                <Select.Content>
                  <Select.Item value="free">Free - $0/month</Select.Item>
                  <Select.Item value="pro">Pro - $25/month</Select.Item>
                  <Select.Item value="team">Team - $599/month</Select.Item>
                </Select.Content>
              </Select.Root>
              <Text size="1" color="gray">
                Which plan fits your organization&apos;s needs best?{' '}
                <RadixLink asChild>
                  <Link to="#">Learn more.</Link>
                </RadixLink>
              </Text>
            </Flex>

          {error ? (
            <Text size="2" color="red">
              {error}
            </Text>
          ) : null}

          <Flex gap="2" justify="end" mt="2">
            <Button variant="soft" color="gray" asChild>
              <Link to="/organizations">Cancel</Link>
            </Button>
            <Button size="2" disabled={isSubmitting || name.trim().length < 2}>
              {isSubmitting ? 'Creating...' : 'Create organization'}
            </Button>
          </Flex>
          </form>
        </Flex>
      </Card>
    </Box>
  )
}
