import { useEffect, useState } from 'react'
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
  Spinner,
} from '@radix-ui/themes'
import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'
import { listOrganizations } from '../../services/orgApi'

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
  const [orgs, setOrgs] = useState([])
  const [canCreate, setCanCreate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    const timer = setTimeout(() => {
      ;(async () => {
        try {
          const response = await listOrganizations(search)
          if (!mounted) return
          setOrgs(response.orgs || [])
          setCanCreate(Boolean(response.canCreate))
          setError('')
        } catch (err) {
          if (!mounted) return
          setError(err instanceof Error ? err.message : 'Failed to load organizations')
        } finally {
          if (mounted) setIsLoading(false)
        }
      })()
    }, 250)
    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [search])

  return (
    <Box p="6">
      <Flex direction="column" gap="5">
        <Heading size="7">Your Organizations</Heading>

        <Flex gap="3" align="center" wrap="wrap">
          <TextField.Root
            placeholder="Search for an organization"
            size="2"
            variant="surface"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ flex: 1, minWidth: 280 }}
          >
            <TextField.Slot side="left">
              <MagnifyingGlassIcon width="18" height="18" />
            </TextField.Slot>
          </TextField.Root>
          {canCreate ? (
            <Button size="2" asChild>
              <Link to="/organizations/new">
                <PlusIcon width="18" height="18" />
                New organization
              </Link>
            </Button>
          ) : (
            <Button size="2" variant="soft" asChild>
              <Link to="/organizations/plans">
                <PlusIcon width="18" height="18" />
                New organization
              </Link>
            </Button>
          )}
        </Flex>

        {!canCreate ? (
          <Text size="1" color="gray">
            Your first organization is free. Upgrade a plan to create additional organizations.
          </Text>
        ) : null}

        {isLoading ? (
          <Flex justify="center" p="5">
            <Spinner />
          </Flex>
        ) : null}

        {error ? (
          <Text size="2" color="red">
            {error}
          </Text>
        ) : null}

        {!isLoading && !error && orgs.length === 0 ? (
          <Text size="2" color="gray">
            No organizations found.
          </Text>
        ) : null}

        <Grid
          columns={{ initial: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
          gap="4"
        >
          {orgs.map((org) => (
            <Card key={org.id} variant="surface" size="2" asChild>
              <Link to={`/organizations/${org.id}/projects`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Flex gap="3" align="start">
                  <OrgIcon />
                  <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                    <Text size="2" weight="medium" trim="end">
                      {org.name}
                    </Text>
                    <Text size="1" color="gray">
                      {org.plan || 'Active'}
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
