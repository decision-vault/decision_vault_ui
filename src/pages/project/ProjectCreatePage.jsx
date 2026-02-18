import { Link, useParams } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Card,
  Checkbox,
  Link as RadixLink,
  Select,
  IconButton,
} from '@radix-ui/themes'
import { useState } from 'react'
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'

const ORG_NAMES = {
  '1': 'bloom-majesty',
  '2': 'bm',
  '3': 'kvstudio',
  '4': 'kavi',
}

export function ProjectCreatePage() {
  const { orgId } = useParams()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Box p="6" style={{ maxWidth: 560, margin: '0 auto' }}>
      <Card variant="surface" size="3">
        <Flex direction="column" gap="5" p="6">
          <Flex direction="column" gap="1">
            <Heading size="6">Create a new project</Heading>
            <Text size="2" color="gray">
              Your project will have its own dedicated instance and full Postgres database. An
              API will be set up so you can easily interact with your new database.
            </Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Organization
            </Text>
            <Select.Root defaultValue={orgId} size="3">
              <Select.Trigger variant="surface" style={{ width: '100%' }} />
              <Select.Content>
                <Select.Item value="1">{ORG_NAMES['1']} FREE</Select.Item>
                <Select.Item value="2">{ORG_NAMES['2']} FREE</Select.Item>
                <Select.Item value="3">{ORG_NAMES['3']} FREE</Select.Item>
                <Select.Item value="4">{ORG_NAMES['4']} FREE</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Project name
            </Text>
            <TextField.Root placeholder="Project name" size="3" variant="surface" />
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Database password
            </Text>
            <TextField.Root
              type={showPassword ? 'text' : 'password'}
              placeholder="Type in a strong password"
              size="3"
              variant="surface"
            >
              <TextField.Slot side="right">
                <IconButton
                  type="button"
                  variant="ghost"
                  size="1"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeClosedIcon width="16" height="16" /> : <EyeOpenIcon width="16" height="16" />}
                </IconButton>
              </TextField.Slot>
            </TextField.Root>
            <Text size="1" color="gray">
              This is the password to your Postgres database, so it must be strong and hard to
              guess. <RadixLink asChild><Link to="#">Generate a password.</Link></RadixLink>
            </Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Region
            </Text>
            <Select.Root defaultValue="ap-southeast-1" size="3">
              <Select.Trigger variant="surface" style={{ width: '100%' }} />
              <Select.Content>
                <Select.Item value="ap-southeast-1">Asia-Pacific (Singapore)</Select.Item>
                <Select.Item value="us-east-1">US East</Select.Item>
                <Select.Item value="eu-west-1">Europe (Ireland)</Select.Item>
              </Select.Content>
            </Select.Root>
            <Text size="1" color="gray">
              Select the region closest to your users for the best performance.
            </Text>
          </Flex>

          <Flex direction="column" gap="3">
            <Flex gap="2" align="start">
              <Checkbox defaultChecked size="2" />
              <Flex direction="column" gap="0">
                <Text size="2" weight="medium">
                  Enable Data API
                </Text>
                <Text size="1" color="gray">
                  Autogenerate a RESTful API for your public schema. Recommended if using a client
                  library like <RadixLink asChild><Link to="#">supabase-js</Link></RadixLink>.
                </Text>
              </Flex>
            </Flex>
            <Flex gap="2" align="start">
              <Checkbox size="2" />
              <Flex direction="column" gap="0">
                <Text size="2" weight="medium">
                  Enable automatic RLS
                </Text>
                <Text size="1" color="gray">
                  Create an event trigger that automatically enables Row Level Security on all new
                  tables in the public schema.
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <RadixLink asChild size="1" color="gray">
            <Link to="#">ADVANCED CONFIGURATION &gt;</Link>
          </RadixLink>

          <Flex gap="3" justify="end" mt="2">
            <Button variant="soft" color="gray" asChild>
              <Link to={`/organizations/${orgId}/projects`}>Cancel</Link>
            </Button>
            <Button color="green">Create new project</Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}
