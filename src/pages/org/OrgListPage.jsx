import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Card,
  Grid,
} from '@radix-ui/themes'
import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'

const MOCK_ORGS = [
  { id: '1', name: 'bloom-majesty', plan: 'Free Plan' },
  { id: '2', name: 'bm', plan: 'Free Plan'},
  { id: '3', name: 'kvstudio', plan: 'Free Plan'},
  { id: '4', name: 'kavi', plan: 'Free Plan'},
]

function OrgIcon() {
  return (
    <Box
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: 'var(--gray-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        style={{
          width: 20,
          height: 20,
          border: '2px solid var(--gray-8)',
          borderRadius: '50%',
          position: 'relative',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 2,
            height: 6,
            background: 'var(--gray-8)',
            borderRadius: 1,
          }}
        />
      </Box>
    </Box>
  )
}

export function OrgListPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_ORGS.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box p="6">
      <Flex direction="column" gap="6">
        <Heading size="8">Your Organizations</Heading>

        <Flex gap="3" align="center" wrap="wrap">
          <TextField.Root
            placeholder="Search for an organization"
            size="3"
            variant="surface"
            value={search}
            onValueChange={setSearch}
            style={{ flex: 1, minWidth: 280 }}
          >
            <TextField.Slot side="left">
              <MagnifyingGlassIcon width="18" height="18" />
            </TextField.Slot>
          </TextField.Root>
          <Button size="3" color="green" asChild>
            <Link to="/organizations/new">
              <PlusIcon width="18" height="18" />
              New organization
            </Link>
          </Button>
        </Flex>

        <Grid
          columns={{ initial: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
          gap="4"
        >
          {filtered.map((org) => (
            <Card key={org.id} variant="surface" size="3" asChild>
              <Link to={`/organizations/${org.id}/projects`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Flex gap="3" align="start">
                  <OrgIcon />
                  <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                    <Text size="3" weight="medium" trim="end">
                      {org.name}
                    </Text>
                    <Text size="2" color="gray">
                      {org.plan}
                    </Text>
                    {org.projectCount != null && (
                      <Text size="1" color="gray">
                        {org.projectCount} project{org.projectCount !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </Link>
            </Card>
          ))}
        </Grid>
      </Flex>
    </Box>
  )
}
