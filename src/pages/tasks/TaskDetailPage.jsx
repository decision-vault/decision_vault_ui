import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
  TextArea,
} from '@radix-ui/themes'

import { getTask } from '../../services/taskApi'

export default function TaskDetailPage() {
  const { projectId, taskId } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTask()
  }, [taskId])

  const loadTask = async () => {
    try {
      setLoading(true)

      const data = await getTask(taskId)

      setTask(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box p="6">
        <Text>Loading task...</Text>
      </Box>
    )
  }

  if (!task) {
    return (
      <Box p="6">
        <Text>Task not found</Text>
      </Box>
    )
  }

  return (
    <Box p="6">
      <Flex direction="column" gap="5">

        <Flex justify="between" align="center">
          <Box>
            <Heading size="7">
              {task.title}
            </Heading>

            <Text color="gray">
              Task ID: {task.id}
            </Text>
          </Box>

          <Flex gap="2">
            <Button
              variant="soft"
              onClick={() =>
                navigate(`/projects/${projectId}/tasks`)
              }
            >
              Back
            </Button>

            <Button>
              Edit Task
            </Button>
          </Flex>
        </Flex>

        <Grid columns="4" gap="4">

          <Card>
            <Flex direction="column">
              <Text color="gray">Status</Text>
              <Badge>{task.status}</Badge>
            </Flex>
          </Card>

          <Card>
            <Flex direction="column">
              <Text color="gray">Priority</Text>
              <Badge color="orange">
                {task.priority}
              </Badge>
            </Flex>
          </Card>

          <Card>
            <Flex direction="column">
              <Text color="gray">Role</Text>
              <Text>{task.role}</Text>
            </Flex>
          </Card>

          <Card>
            <Flex direction="column">
              <Text color="gray">Story Points</Text>
              <Heading>{task.story_points}</Heading>
            </Flex>
          </Card>

        </Grid>

        <Card>
          <Flex direction="column" gap="3">

            <Heading size="4">
              Description
            </Heading>

            <Text>
              {task.description || 'No description'}
            </Text>

          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="3">

            <Heading size="4">
              Acceptance Criteria
            </Heading>

            <Text>
              {task.acceptance_criteria ||
                'No acceptance criteria'}
            </Text>

          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="3">

            <Heading size="4">
              Activity Timeline
            </Heading>

            <Separator size="4" />

            <Text color="gray">
              Task created
            </Text>

            <Text color="gray">
              Status updates will appear here
            </Text>

            <Text color="gray">
              Comments will appear here
            </Text>

          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="3">

            <Heading size="4">
              Comments
            </Heading>

            <TextArea
              placeholder="Write a comment..."
            />

            <Flex justify="end">
              <Button>
                Add Comment
              </Button>
            </Flex>

          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="3">

            <Heading size="4">
              AI Assistant
            </Heading>

            <Text color="gray">
              Future Agent Actions:
            </Text>

            <ul>
              <li>Generate subtasks</li>
              <li>Estimate effort</li>
              <li>Review implementation plan</li>
              <li>Generate test cases</li>
              <li>Generate API contracts</li>
            </ul>

          </Flex>
        </Card>

      </Flex>
    </Box>
  )
}