import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Card,
  TextArea,
} from '@radix-ui/themes'
import { createProject } from '../../services/projectApi'

const isElectron = window.decisionVaultDesktop?.isDesktop === true

export function ProjectCreatePage() {
  const { orgId } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [localPath, setLocalPath] = useState('')
  const [isPickingFolder, setIsPickingFolder] = useState(false)

  const handleSelectFolder = async () => {
    if (!window.decisionVaultDesktop?.selectFolder) return
    setIsPickingFolder(true)
    try {
      const selected = await window.decisionVaultDesktop.selectFolder()
      if (selected) setLocalPath(selected)
    } catch (err) {
      console.error('Folder selection failed:', err)
    } finally {
      setIsPickingFolder(false)
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    setError('')
    try {
      const projectDir = localPath ? `${localPath}/${name.trim()}` : ''
      await createProject(orgId, {
        name: name.trim(),
        description: description.trim() || undefined,
        project_dir: projectDir || undefined,
      })
      if (isElectron && localPath && name.trim()) {
        const projectFolder = `${localPath}/${name.trim()}`
        await window.decisionVaultDesktop.createDirectory(projectFolder)
      }
      navigate(`/organizations/${orgId}/projects`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
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
              <Heading size="5">Create a new project</Heading>
              <Text size="2" color="gray">
                Projects are a way to group your work. Each project gets its own PRD,
                roadmap, and UI builder pipeline.
              </Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Name
              </Text>
              <TextField.Root
                placeholder="Project name"
                size="2"
                variant="surface"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoFocus
              />
              <Text size="1" color="gray">
                What&apos;s the name of your project? You can change this later.
              </Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Description
              </Text>
              <TextArea
                placeholder="What is this project about?"
                size="2"
                variant="surface"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
                style={{ minHeight: '80px' }}
              />
              <Text size="1" color="gray">
                Optional. A short summary helps kavi ai generate a better baseline.
              </Text>
            </Flex>

            {isElectron && (
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">
                  Project Directory
                </Text>
                <Flex gap="2" align="center">
                  <TextField.Root
                    placeholder="Select or type a folder path"
                    size="2"
                    variant="surface"
                    value={localPath}
                    onChange={(e) => setLocalPath(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="button"
                    variant="soft"
                    color="gray"
                    size="2"
                    onClick={handleSelectFolder}
                    disabled={isPickingFolder}
                  >
                    {isPickingFolder ? 'Selecting...' : 'Browse'}
                  </Button>
                </Flex>
                <Text size="1" color="gray">
                  Optional. Where agents will run commands.
                </Text>
              </Flex>
            )}

            {error ? (
              <Text size="2" color="red">
                {error}
              </Text>
            ) : null}

            <Flex gap="2" justify="end" mt="2">
              <Button variant="soft" color="gray" asChild>
                <Link to={`/organizations/${orgId}/projects`}>Cancel</Link>
              </Button>
              <Button size="2" disabled={isSubmitting || name.trim().length < 2}>
                {isSubmitting ? 'Creating...' : 'Create project'}
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Box>
  )
}
