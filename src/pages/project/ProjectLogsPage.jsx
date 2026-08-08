import { Box, Flex, Text, Card, ScrollArea, Badge } from '@radix-ui/themes'
import { FileText, Clock } from 'lucide-react'

const MOCK_LOGS = [
  { id: 1, level: 'info',    message: 'Project initialized successfully.',               time: '2 min ago' },
  { id: 2, level: 'info',    message: 'Workflow generation pipeline started.',           time: '5 min ago' },
  { id: 3, level: 'success', message: 'PRD document indexed and ready.',                 time: '8 min ago' },
  { id: 4, level: 'warning', message: 'LangGraph agent response latency > 3s.',         time: '12 min ago' },
  { id: 5, level: 'info',    message: 'Sprint plan generated: 6 sprints, 57 tasks.',    time: '15 min ago' },
  { id: 6, level: 'info',    message: 'React Flow layout computed for workflow graph.',  time: '15 min ago' },
]

const LEVEL_COLOR = { info: 'blue', success: 'green', warning: 'amber', error: 'red' }

export function ProjectLogsPage() {
  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Flex
        align="center" justify="between" px="6"
        style={{
          borderBottom: '1px solid var(--gray-4)',
          background: 'var(--color-panel-solid)',
          flexShrink: 0,
          height: 41,
        }}
      >
        <Flex align="center" gap="2">
          <FileText size={14} color="var(--gray-9)" />
          <Text size="2" color="gray">Project</Text>
          <Text size="2" color="gray">/</Text>
          <Text size="3" weight="medium">System Logs</Text>
        </Flex>
        <Badge size="1" color="blue" variant="soft">Live</Badge>
      </Flex>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <ScrollArea style={{ flex: 1 }}>
        <Box p="6">
          <Card size="1" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)', overflow: 'hidden' }}>
            {/* Log header */}
            <Flex
              align="center" justify="between" px="4" py="2"
              style={{ borderBottom: '1px solid var(--gray-4)', background: 'var(--gray-2)' }}
            >
              <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>
                Activity Log
              </Text>
              <Flex align="center" gap="1">
                <Clock size={10} color="var(--gray-8)" />
                <Text size="1" color="gray" style={{ fontSize: 10 }}>Most recent first</Text>
              </Flex>
            </Flex>

            {/* Log rows */}
            {MOCK_LOGS.map((log, i) => (
              <Flex
                key={log.id}
                align="start"
                gap="3"
                px="4"
                py="3"
                style={{
                  borderBottom: i < MOCK_LOGS.length - 1 ? '1px solid var(--gray-3)' : 'none',
                }}
              >
                <Badge size="1" color={LEVEL_COLOR[log.level]} variant="soft" style={{ flexShrink: 0, marginTop: 1, minWidth: 52, justifyContent: 'center', fontSize: 9 }}>
                  {log.level.toUpperCase()}
                </Badge>
                <Text size="2" style={{ flex: 1, color: 'var(--gray-11)', lineHeight: 1.5 }}>{log.message}</Text>
                <Text size="1" color="gray" style={{ flexShrink: 0, fontSize: 10 }}>{log.time}</Text>
              </Flex>
            ))}

            {/* Footer */}
            <Flex
              px="4" py="3" align="center" justify="center"
              style={{ background: 'var(--gray-2)', borderTop: '1px solid var(--gray-4)' }}
            >
              <Text size="1" color="gray" style={{ fontStyle: 'italic', fontSize: 11 }}>
                Project activity logs will stream here in real-time.
              </Text>
            </Flex>
          </Card>
        </Box>
      </ScrollArea>
    </Box>
  )
}
