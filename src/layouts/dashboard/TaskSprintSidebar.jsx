import React, { useEffect, useState } from 'react'
import { Box, Flex, Heading, Button, Text, Separator, Badge } from '@radix-ui/themes'
import { getTasks } from '../../services/taskApi'

export function TaskSprintSidebar({
  sprints,
  sprintFilter,
  sprintLoading,
  onSprintSelect,
  onAddSprintClick,
  onRemoveSprint,
  projectId
}) {
  const [taskCounts, setTaskCounts] = useState({ all: 0, none: 0, sprints: {} })
  const [countsLoading, setCountsLoading] = useState(false)

  useEffect(() => {
    if (!projectId) return
    setCountsLoading(true)
    getTasks(projectId)
      .then((tasks) => {
        if (!Array.isArray(tasks)) return
        const counts = { all: tasks.length, none: 0, sprints: {} }
        tasks.forEach((t) => {
          if (!t.sprint_id) counts.none++
          else counts.sprints[t.sprint_id] = (counts.sprints[t.sprint_id] || 0) + 1
        })
        setTaskCounts(counts)
      })
      .catch(() => {})
      .finally(() => setCountsLoading(false))
  }, [projectId, sprints])

  return (
    <Box
      p="4"
      style={{
        borderRight: '1px solid var(--gray-4)',
        background: 'var(--color-panel-background)',
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        .sprint-row .trash-btn { opacity: 0; transform: scale(0.9); transition: all 0.15s ease; }
        .sprint-row:hover .trash-btn { opacity: 1; transform: scale(1); }
        .nav-item { transition: background 0.12s ease, color 0.12s ease; }
        .sprint-progress { height: 3px; border-radius: 2px; background: var(--gray-4); overflow: hidden; }
        .sprint-progress-fill { height: 100%; border-radius: 2px; background: var(--blue-8); transition: width 0.3s ease; }
      `}</style>

      <Flex direction="column" gap="4" style={{ flexGrow: 1 }}>
        <Flex justify="between" align="center" px="1">
          <Heading size="1" color="gray" style={{ letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: '600' }}>
            Sprints
          </Heading>
          <Button
            size="1"
            variant="ghost"
            color="gray"
            highContrast
            onClick={onAddSprintClick}
            style={{ borderRadius: '6px', cursor: 'pointer', gap: '4px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5v14" /></svg>
            New
          </Button>
        </Flex>

        <Separator size="4" style={{ opacity: 0.4 }} />

        <Flex direction="column" gap="1">
          <Flex
            align="center"
            gap="3"
            px="3"
            py="2"
            className="nav-item"
            onClick={() => onSprintSelect('all')}
            style={{
              cursor: 'pointer',
              borderRadius: '8px',
              background: sprintFilter === 'all' ? 'var(--blue-3)' : 'transparent',
              color: sprintFilter === 'all' ? 'var(--blue-11)' : 'var(--gray-11)',
            }}
          >
            <Box style={{ opacity: sprintFilter === 'all' ? 1 : 0.6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
            </Box>
            <Text size="2" weight={sprintFilter === 'all' ? 'bold' : 'medium'} style={{ flex: 1 }}>All Tasks</Text>
            {!countsLoading && taskCounts.all > 0 && (
              <Badge size="1" variant="soft" color="gray" style={{ minWidth: 20, justifyContent: 'center' }}>{taskCounts.all}</Badge>
            )}
          </Flex>

          <Flex
            align="center"
            gap="3"
            px="3"
            py="2"
            className="nav-item"
            onClick={() => onSprintSelect('none')}
            style={{
              cursor: 'pointer',
              borderRadius: '8px',
              background: sprintFilter === 'none' ? 'var(--blue-3)' : 'transparent',
              color: sprintFilter === 'none' ? 'var(--blue-11)' : 'var(--gray-11)',
            }}
          >
            <Box style={{ opacity: sprintFilter === 'none' ? 1 : 0.6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
            </Box>
            <Text size="2" weight={sprintFilter === 'none' ? 'bold' : 'medium'} style={{ flex: 1 }}>Backlog</Text>
            {!countsLoading && taskCounts.none > 0 && (
              <Badge size="1" variant="soft" color="gray" style={{ minWidth: 20, justifyContent: 'center' }}>{taskCounts.none}</Badge>
            )}
          </Flex>

          <Box mt="3">
            <Text size="1" color="gray" weight="bold" mb="2" pl="2" style={{ display: 'block', fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.8 }}>
              Sprints
            </Text>

            {sprintLoading ? (
              <Flex direction="column" gap="2" p="2">
                {[1, 2].map(i => (
                  <div key={i} style={{ height: 36, borderRadius: 8, background: 'var(--gray-3)', opacity: 0.5 }} />
                ))}
              </Flex>
            ) : sprints.length === 0 ? (
              <Box p="3" style={{ border: '1px dashed var(--gray-5)', borderRadius: '8px', textAlign: 'center' }}>
                <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>No sprints yet</Text>
              </Box>
            ) : (
              <Flex direction="column" gap="1">
                {sprints.map((s) => {
                  const currentId = s.id || s._id
                  const isActive = sprintFilter === currentId
                  const count = taskCounts.sprints[currentId] || 0
                  const doneCount = 0
                  const progress = count > 0 ? Math.round((doneCount / count) * 100) : 0
                  return (
                    <Flex
                      key={currentId}
                      align="center"
                      justify="between"
                      px="3"
                      py="2"
                      className="sprint-row nav-item"
                      onClick={() => onSprintSelect(currentId)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        background: isActive ? 'var(--blue-3)' : 'transparent',
                        color: isActive ? 'var(--blue-11)' : 'var(--gray-12)',
                      }}
                    >
                      <Flex direction="column" gap="1" style={{ minWidth: 0, flexGrow: 1 }}>
                        <Flex align="center" gap="2">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--blue-11)' : 'var(--gray-7)'} strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" /></svg>
                          <Text size="2" weight={isActive ? 'bold' : 'medium'} truncate style={{ flex: 1 }}>{s.name}</Text>
                          {!countsLoading && (
                            <Badge size="1" variant="soft" color={isActive ? 'green' : 'gray'} style={{ minWidth: 20, justifyContent: 'center' }}>{count}</Badge>
                          )}
                        </Flex>
                        {count > 0 && (
                          <div className="sprint-progress" style={{ marginLeft: 20 }}>
                            <div className="sprint-progress-fill" style={{ width: `${progress}%` }} />
                          </div>
                        )}
                      </Flex>

                      <Button
                        size="1"
                        variant="soft"
                        color="red"
                        className="trash-btn"
                        onClick={(e) => onRemoveSprint(currentId, e)}
                        style={{ padding: '4px', height: 'auto', borderRadius: '4px', cursor: 'pointer', marginLeft: 4 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                      </Button>
                    </Flex>
                  )
                })}
              </Flex>
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}
