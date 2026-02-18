import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Card,
  Grid,
  IconButton,
  Badge,
  DropdownMenu,
} from '@radix-ui/themes'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MixerHorizontalIcon,
  ViewGridIcon,
  ListBulletIcon,
  DotsVerticalIcon,
  PauseIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons'

const MOCK_PROJECTS = [
  {
    id: '1',
    name: 'meny-app',
    region: 'AWS | ap-southeast-1',
    status: 'PAUSED',
    statusMessage: 'Project is paused',
  },
]

export function ProjectListPage() {
  const { orgId } = useParams()
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const projects = MOCK_PROJECTS
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  const isEmpty = filtered.length === 0

  return (
    <Box p="6">
      <Flex direction="column" gap="6">
        <Heading size="8">Projects</Heading>

        <Flex gap="3" align="center" wrap="wrap">
          <TextField.Root
            placeholder="Search for a project"
            size="3"
            variant="surface"
            value={search}
            onValueChange={setSearch}
            style={{ flex: 1, minWidth: 240 }}
          >
            <TextField.Slot side="left">
              <MagnifyingGlassIcon width="18" height="18" />
            </TextField.Slot>
          </TextField.Root>
          <IconButton variant="soft" size="3" aria-label="Filter">
            <MixerHorizontalIcon width="18" height="18" />
          </IconButton>
          <IconButton
            variant={view === 'grid' ? 'soft' : 'ghost'}
            size="3"
            aria-label="Grid view"
            onClick={() => setView('grid')}
          >
            <ViewGridIcon width="18" height="18" />
          </IconButton>
          <IconButton
            variant={view === 'list' ? 'soft' : 'ghost'}
            size="3"
            aria-label="List view"
            onClick={() => setView('list')}
          >
            <ListBulletIcon width="18" height="18" />
          </IconButton>
          <Button size="3" color="green" asChild>
            <Link to={`/organizations/${orgId}/projects/new`}>
              <PlusIcon width="18" height="18" />
              New project
            </Link>
          </Button>
        </Flex>

        {isEmpty ? (
          <Card
            variant="surface"
            size="3"
            style={{
              border: '2px dashed var(--gray-6)',
              background: 'var(--color-panel-translucent)',
            }}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap="4"
              p="8"
              style={{ minHeight: 320 }}
            >
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'var(--gray-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlusIcon width="28" height="28" style={{ opacity: 0.7 }} />
              </Box>
              <Flex direction="column" align="center" gap="1">
                <Heading size="6">Create a project</Heading>
                <Text size="2" color="gray">
                  Launch a complete backend built on Postgres.
                </Text>
              </Flex>
              <Button size="3" variant="soft" color="gray" asChild>
                <Link to={`/organizations/${orgId}/projects/new`}>
                  <PlusIcon width="18" height="18" />
                  New project
                </Link>
              </Button>
            </Flex>
          </Card>
        ) : (
          <Grid
            columns={{ initial: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap="4"
          >
            {filtered.map((project) => (
              <Card key={project.id} variant="surface" size="3" asChild>
                <Link
                  to={`/organizations/${orgId}/projects/${project.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Flex direction="column" gap="2">
                    <Flex justify="between" align="start">
                      <Text size="3" weight="bold" trim="end">
                        {project.name}
                      </Text>
                      <Box onClick={(e) => e.stopPropagation()} style={{ margin: -4 }}>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger>
                            <IconButton variant="ghost" size="1" radius="full" aria-label="Options">
                              <DotsVerticalIcon width="16" height="16" />
                            </IconButton>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content>
                            <DropdownMenu.Item>Restore</DropdownMenu.Item>
                            <DropdownMenu.Item>Settings</DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Box>
                    </Flex>
                    <Text size="2" color="gray">
                      {project.region}
                    </Text>
                    <Badge size="1" color="gray">
                      {project.status}
                    </Badge>
                    <Flex align="center" gap="1">
                      <PauseIcon width="14" height="14" style={{ opacity: 0.7 }} />
                      <InfoCircledIcon width="14" height="14" style={{ opacity: 0.7 }} />
                      <Text size="1" color="gray">
                        {project.statusMessage}
                      </Text>
                    </Flex>
                  </Flex>
                </Link>
              </Card>
            ))}
          </Grid>
        )}
      </Flex>
    </Box>
  )
}
