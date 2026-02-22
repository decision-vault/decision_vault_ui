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
import { useState } from 'react'
import { createProject } from '../../services/projectApi'

export function ProjectCreatePage() {
  const { orgId } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    setError('')
    try {
      await createProject(orgId, {
        name: name.trim(),
        description: description.trim() || undefined,
      })
      navigate(`/organizations/${orgId}/projects`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box p="6" style={{ maxWidth: 560, margin: '0 auto' }}>
      <Card variant="surface" size="3">
        <Flex asChild direction="column" gap="5" p="6">
          <form onSubmit={onSubmit}>
          <Flex direction="column" gap="1">
            <Heading size="6">Create a new project</Heading>
            <Text size="2" color="gray">
              Fill only required API fields for project creation.
            </Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Project name *
            </Text>
            <TextField.Root
              placeholder="Project name"
              size="3"
              variant="surface"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={160}
              required
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Description
            </Text>
            <TextArea
              placeholder="Optional description"
              size="3"
              variant="surface"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
            />
          </Flex>

          {error ? (
            <Text size="2" color="red">
              {error}
            </Text>
          ) : null}

          <Flex gap="3" justify="end" mt="2">
            <Button variant="soft" color="gray" asChild>
              <Link to={`/organizations/${orgId}/projects`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || name.trim().length < 2}>
              {isSubmitting ? 'Creating...' : 'Create new project'}
            </Button>
          </Flex>
          </form>
        </Flex>
      </Card>
    </Box>
  )
}
