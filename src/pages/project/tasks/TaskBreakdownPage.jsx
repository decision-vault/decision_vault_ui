import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Flex, Text, Button, ScrollArea } from '@radix-ui/themes'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import {
  TASK_PROJECT_META,
  ROLES_WITH_TASKS,
  TASK_SUMMARY,
  TASK_DEPENDENCIES,
} from './taskData'

function TaskRow({ task }) {
  return (
    <Box
      style={{
        padding: '10px 0',
        borderBottom: '1px solid var(--gray-4)',
      }}
    >
      <Flex align="center" gap="3" wrap="wrap">
        <Text size="2" style={{ fontFamily: 'monospace', minWidth: 44 }}>
          {task.id}
        </Text>
        <Text size="2">{task.task}</Text>
        <Text size="2" color="gray">
          {task.estimate}
        </Text>
      </Flex>
      {task.description && (
        <Text size="1" color="gray" mt="1" style={{ display: 'block', paddingLeft: 52 }}>
          {task.description}
        </Text>
      )}
      {task.acceptanceCriteria && (
        <Text size="1" color="gray" mt="0" style={{ display: 'block', paddingLeft: 52 }}>
          Accept: {task.acceptanceCriteria}
        </Text>
      )}
    </Box>
  )
}

export function TaskBreakdownPage() {
  const { orgId, projectId } = useParams()
  const [activeRole, setActiveRole] = useState(ROLES_WITH_TASKS[0].id)
  const activeRoleData = ROLES_WITH_TASKS.find((r) => r.id === activeRole)

  return (
    <Flex
      direction="column"
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        background: 'var(--color-background)',
      }}
    >
      {/* Header */}
      <Flex
        p="3"
        align="center"
        gap="3"
        style={{
          borderBottom: '1px solid var(--gray-6)',
          flexShrink: 0,
        }}
      >
        <Button variant="ghost" size="2" asChild>
          <Link to={`/organizations/${orgId}/projects/${projectId}`}>
            <ArrowLeftIcon width="18" height="18" /> Back
          </Link>
        </Button>
        <Text size="2" weight="medium">
          {TASK_PROJECT_META.projectName} · Task breakdown · {TASK_SUMMARY.totalTasks} tasks, {TASK_SUMMARY.totalDays} d
        </Text>
      </Flex>

      <Flex style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Role list (sidebar) */}
        <Box
          style={{
            width: 160,
            flexShrink: 0,
            borderRight: '1px solid var(--gray-5)',
            overflow: 'auto',
          }}
        >
          <Box p="2">
            {ROLES_WITH_TASKS.map((role) => (
              <Box
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                style={{
                  padding: '8px 10px',
                  cursor: 'pointer',
                  background: activeRole === role.id ? 'var(--gray-3)' : 'transparent',
                  borderRadius: 4,
                }}
              >
                <Text size="2">{role.shortTitle}</Text>
                <Text size="1" color="gray">
                  {' '}
                  {role.taskCount} tasks
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Main: plain task list */}
        <ScrollArea
          type="auto"
          scrollbars="vertical"
          style={{ flex: 1, height: '100%', minWidth: 0 }}
        >
          <Box p="4" style={{ maxWidth: 720 }}>
            <Text size="2" color="gray" mb="3" style={{ display: 'block' }}>
              {activeRoleData?.title} · {activeRoleData?.estimateDays} d
            </Text>
            <Box mb="4">
              {activeRoleData?.tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </Box>

            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Summary
            </Text>
            <ul style={{ margin: 0, paddingLeft: 18, marginBottom: 16 }}>
              {ROLES_WITH_TASKS.map((role) => (
                <li key={role.id}>
                  <Text size="2">
                    {role.shortTitle}: {role.taskCount} tasks, {role.estimateDays} d
                  </Text>
                </li>
              ))}
            </ul>

            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Dependencies
            </Text>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {TASK_DEPENDENCIES.map((line, i) => (
                <li key={i}>
                  <Text size="2" color="gray">
                    {line}
                  </Text>
                </li>
              ))}
            </ul>
          </Box>
        </ScrollArea>
      </Flex>
    </Flex>
  )
}
