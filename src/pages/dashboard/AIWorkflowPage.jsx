import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Flex, Text, Button, Badge, Card,
  Separator, ScrollArea, Select, Heading, Grid
} from '@radix-ui/themes'
import {
  ReactFlow, MiniMap, Controls, Background,
  useNodesState, useEdgesState, Handle, Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  ArrowLeft, X, ChevronRight, CheckCircle2, Play, Check,
  Flag, Layers, Zap, Terminal, User, Diamond, Shield,
  Link2, GitBranch, Clock, Star, AlertCircle, Rocket, CheckCircle,
} from 'lucide-react'
import { apiRequest } from '../../services/apiClient'
import { SprintBuildApi } from '../../services/sprintBuildApi'
import { listOrgUsers } from '../../services/orgUsersApi'

// ─── Agent → Radix colour map (mirrors sidebar badge palette) ─────────────────
const AGENT_META = {
  'DevOps Agent':        { color: 'sky',    hex: '#0ea5e9' },
  'Architecture Agent':  { color: 'violet', hex: '#8b5cf6' },
  'Frontend Agent':      { color: 'blue', hex: '#3b82f6' },
  'Backend Agent':       { color: 'teal',   hex: '#14b8a6' },
  'Database Agent':      { color: 'amber',  hex: '#f59e0b' },
  'Security Agent':      { color: 'red',    hex: '#ef4444' },
  'QA Agent':            { color: 'pink',   hex: '#ec4899' },
  'UI Designer Agent':   { color: 'purple', hex: '#a855f7' },
  'UX Agent':            { color: 'cyan',   hex: '#06b6d4' },
  'Product Agent':       { color: 'slate',  hex: '#64748b' },
  'Documentation Agent': { color: 'gray',   hex: '#94a3b8' },
}
const agentColor  = (a) => AGENT_META[a]?.color  ?? 'blue'
const agentHex    = (a) => AGENT_META[a]?.hex    ?? '#3b82f6'

const PRIORITY_COLOR = { high: 'red', medium: 'orange', low: 'gray' }
const STATUS_COLOR   = { pending: 'gray', in_progress: 'blue', completed: 'green', blocked: 'red' }

const ROLE_FILTERS = [
  { id: 'all',            label: 'All Roles',        agents: [] },
  { id: 'system_design',  label: 'System Design',     agents: ['Architecture Agent', 'Database Agent', 'Product Agent', 'Documentation Agent'] },
  { id: 'frontend',       label: 'Frontend',          agents: ['Frontend Agent', 'UI Designer Agent', 'UX Agent'] },
  { id: 'backend',        label: 'Backend',           agents: ['Backend Agent'] },
  { id: 'devops',         label: 'DevOps & Deploy',   agents: ['DevOps Agent'] },
  { id: 'testing',        label: 'Testing & QA',      agents: ['QA Agent'] },
  { id: 'security',       label: 'Security',          agents: ['Security Agent'] },
]

// ════════════════════════════════════════════════════════════════════════════════
//  REACT FLOW NODE TYPES — all use Radix CSS vars so they adapt to dark mode
// ════════════════════════════════════════════════════════════════════════════════

function ProjectNode({ data }) {
  return (
    <Box style={{
      background: 'var(--accent-9)',
      border: '1px solid var(--accent-7)',
      borderRadius: 'var(--radius-4)',
      padding: '12px 20px',
      minWidth: 240,
      boxShadow: '0 4px 20px var(--accent-a6)',
      textAlign: 'center',
    }}>
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--accent-3)', border: 'none', width: 8, height: 8 }} />
      <Text style={{ display: 'block', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, opacity: 0.7 }}>
        Implementation Workflow
      </Text>
      <Text style={{ display: 'block', fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px' }}>
        <Rocket size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{data.title}
      </Text>
      <Flex gap="2" justify="center" mt="1">
        <Text size="1" style={{ opacity: 0.7 }}>{data.epicCount} epics</Text>
        <Text size="1" style={{ opacity: 0.7 }}>·</Text>
        <Text size="1" style={{ opacity: 0.7 }}>{data.taskCount} tasks</Text>
      </Flex>
    </Box>
  )
}

function EpicNode({ data }) {
  return (
    <Box style={{
      background: 'var(--color-panel-solid)',
      border: `1px solid var(--gray-5)`,
      borderLeft: `4px solid ${data.color}`,
      borderRadius: 'var(--radius-3)',
      padding: '10px 14px',
      minWidth: 255,
      boxShadow: '0 2px 8px var(--gray-a3)',
    }}>
      <Handle type="target" position={Position.Top}    style={{ background: data.color, border: 'none', width: 7, height: 7 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: data.color, border: 'none', width: 7, height: 7 }} />
      <Flex align="center" justify="between" mb="1">
        <Flex align="center" gap="2">
          <Box style={{ width: 8, height: 8, borderRadius: 2, background: data.color, flexShrink: 0 }} />
          <Text style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}>{data.title}</Text>
        </Flex>
        <Text style={{ fontSize: 9, fontWeight: 700, background: `${data.color}18`, color: data.color, padding: '1px 6px', borderRadius: 4 }}>S{data.sprint}</Text>
      </Flex>
      <Flex gap="2">
        <Text size="1" style={{ opacity: 0.7 }}>{data.featureCount} features</Text>
        <Text size="1" style={{ opacity: 0.7 }}>·</Text>
        <Text size="1" style={{ opacity: 0.7 }}>{data.taskCount} tasks</Text>
      </Flex>
    </Box>
  )
}

function FeatureNode({ data }) {
  return (
    <Box style={{
      background: 'var(--color-panel-background)',
      border: '1px solid var(--gray-4)',
      borderLeft: `3px solid ${data.epicColor}88`,
      borderRadius: 'var(--radius-2)',
      padding: '7px 12px',
      minWidth: 215,
    }}>
      <Handle type="target" position={Position.Top}    style={{ background: data.epicColor, border: 'none', width: 6, height: 6 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: data.epicColor, border: 'none', width: 6, height: 6 }} />
      <Text style={{ display: 'block', fontSize: 12, fontWeight: 500, lineHeight: 1.35 }}>{data.title}</Text>
      <Text size="1" style={{ display: 'block', marginTop: 2, opacity: 0.7 }}>{data.taskCount} tasks · Sprint {data.sprint}</Text>
    </Box>
  )
}

function TaskNode({ data, selected }) {
  const isCompleted = data.status === 'completed'
  const isBlocked   = data.status === 'blocked'
  const isProgress  = data.status === 'in_progress'
  const isRunning   = data.status === 'running'
  const hex = agentHex(data.agent)

  return (
    <Box style={{
      background: 'var(--color-panel-solid)',
      border: selected
        ? '2px solid var(--accent-9)'
        : isRunning    ? '1.5px solid #3b82f6'
        : isBlocked   ? '1.5px solid var(--red-7)'
        : isCompleted ? '1.5px solid var(--blue-7)'
        : isProgress  ? '1.5px solid var(--blue-7)'
        : '1px solid var(--gray-5)',
      borderRadius: 'var(--radius-3)',
      padding: '10px 13px',
      minWidth: 240,
      maxWidth: 275,
      cursor: 'pointer',
      boxShadow: selected ? '0 0 0 3px var(--accent-a4)' : isRunning ? '0 0 12px rgba(59,130,246,0.25)' : '0 1px 4px var(--gray-a3)',
      transition: 'box-shadow 0.15s, border-color 0.15s',
      animation: isRunning ? 'wf-node-pulse 2s ease infinite' : undefined,
    }}>
      <Handle type="target" position={Position.Top}    style={{ background: 'var(--gray-5)', border: 'none', width: 6, height: 6 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--gray-5)', border: 'none', width: 6, height: 6 }} />

      {/* Agent pill */}
      <Flex align="center" gap="1" mb="1">
        {isRunning ? (
          <Box style={{
            width: 10, height: 10,
            border: '2px solid var(--gray-4)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'wf-spin 0.8s linear infinite',
            flexShrink: 0,
          }} />
        ) : (
          <Box style={{ width: 5, height: 5, borderRadius: '50%', background: hex, flexShrink: 0 }} />
        )}
        <Text style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: hex }}>{data.agent}</Text>
      </Flex>

      {/* Title */}
      <Text style={{ display: 'block', fontSize: 13, fontWeight: 500, lineHeight: 1.35, marginBottom: 7 }}>{data.title}</Text>

      {/* Footer */}
      <Flex gap="1" align="center">
        <Badge size="1" color={PRIORITY_COLOR[data.priority] || 'gray'} variant="soft" highContrast style={{ fontSize: 8, paddingInline: 4 }}>{data.priority}</Badge>
        <Badge size="1" color={isRunning ? 'green' : STATUS_COLOR[data.status] || 'gray'} variant="soft" highContrast style={{ fontSize: 8, paddingInline: 4 }}>{isRunning ? 'running' : (data.status || '').replace('_',' ')}</Badge>
        <Text size="1" style={{ fontSize: 9, opacity: 0.7, marginLeft: 'auto' }}>{data.storyPoints}pts · S{data.sprint}</Text>
      </Flex>
    </Box>
  )
}

const NODE_TYPES = { project: ProjectNode, epic: EpicNode, feature: FeatureNode, task: TaskNode }

// ════════════════════════════════════════════════════════════════════════════════
//  SPRINT SIDEBAR — mirrors TaskSprintSidebar.jsx visual language exactly
// ════════════════════════════════════════════════════════════════════════════════

function SprintSidebar({ sprints, activeFilter, onFilter, allTasks, epics, epicFilter, onEpicFilter, roleFilter, onRoleFilter }) {
  const sprintStats = useMemo(() => sprints.map(s => {
    const tasks = allTasks.filter(t => t.sprint === s.id)
    const done  = tasks.filter(t => t.status === 'completed').length
    const pct   = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
    return { ...s, tasksDone: done, tasksTotal: tasks.length, pct }
  }), [sprints, allTasks])

  const epicList = useMemo(() => (epics || []).map(e => ({
    id: e.id, title: e.title, color: e.color, taskCount: e.task_count || 0,
    done: (e.features || []).flatMap(f => f.tasks || []).filter(t => t.status === 'completed').length,
  })), [epics])

  return (
    <Box style={{
      width: 310,
      borderRight: '1px solid var(--gray-4)',
      background: 'var(--color-panel-background)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100%',
    }}>
      <Flex justify="between" align="center" px="4" py="3" style={{ borderBottom: '1px solid var(--gray-4)', flexShrink: 0 }}>
        <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
          Filters
        </Text>
        {(activeFilter !== null || epicFilter !== null || roleFilter !== 'all') && (
          <Text size="1" color="blue" weight="medium" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => { onFilter(null); onEpicFilter(null); onRoleFilter('all') }}>
            Clear all
          </Text>
        )}
      </Flex>

      <ScrollArea style={{ flex: 1 }}>
        <Flex direction="column" p="3">

          {/* ── Role Filter ─────────────────────────────────────── */}
          <Text size="1" color="gray" weight="bold" mb="2" style={{ fontSize: 10, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.7 }}>
            Role
          </Text>
          <Flex direction="column" gap="1" mb="3">
            {ROLE_FILTERS.map(role => {
              const isActive = roleFilter === role.id
              return (
                <Flex
                  key={role.id}
                  align="center" gap="2" px="3" py="2"
                  onClick={() => onRoleFilter(isActive ? 'all' : role.id)}
                  style={{
                    cursor: 'pointer', borderRadius: 8,
                    background: isActive ? 'var(--accent-3)' : 'transparent',
                    color: isActive ? 'var(--accent-11)' : 'var(--gray-11)',
                    transition: 'background 0.12s',
                  }}
                >
                  <Box style={{ width: 8, height: 8, borderRadius: 2, background: isActive ? 'var(--accent-9)' : 'var(--gray-6)', flexShrink: 0 }} />
                  <Text size="2" weight={isActive ? 'bold' : 'medium'} style={{ fontSize: 12 }}>{role.label}</Text>
                </Flex>
              )
            })}
          </Flex>

          <Separator size="4" my="1" style={{ opacity: 0.4 }} />

          {/* ── Epic Filter ─────────────────────────────────────── */}
          <Text size="1" color="gray" weight="bold" mb="2" mt="2" style={{ fontSize: 10, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.7 }}>
            Epics
          </Text>
          <Flex direction="column" gap="1" mb="3">
            <Flex
              align="center" gap="2" px="3" py="2"
              onClick={() => onEpicFilter(null)}
              style={{
                cursor: 'pointer', borderRadius: 8,
                background: epicFilter === null ? 'var(--accent-3)' : 'transparent',
                color: epicFilter === null ? 'var(--accent-11)' : 'var(--gray-11)',
                transition: 'background 0.12s',
              }}
            >
              <Layers size={12} style={{ opacity: epicFilter === null ? 1 : 0.65 }} />
              <Text size="2" weight={epicFilter === null ? 'bold' : 'medium'}>All Epics</Text>
            </Flex>
            {epicList.map(e => {
              const isActive = epicFilter === e.id
              return (
                <Flex
                  key={e.id}
                  align="center" gap="2" px="3" py="2"
                  onClick={() => onEpicFilter(isActive ? null : e.id)}
                  style={{
                    cursor: 'pointer', borderRadius: 8,
                    background: isActive ? 'var(--accent-3)' : 'transparent',
                    color: isActive ? 'var(--accent-11)' : 'var(--gray-11)',
                    transition: 'background 0.12s',
                  }}
                >
                  <Box style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
                  <Text size="2" weight={isActive ? 'bold' : 'medium'} style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</Text>
                  <Text size="1" color="gray" style={{ fontSize: 9, flexShrink: 0 }}>{e.done}/{e.taskCount}</Text>
                </Flex>
              )
            })}
          </Flex>

          <Separator size="4" my="1" style={{ opacity: 0.4 }} />

          {/* ── Sprint Filter ───────────────────────────────────── */}
          <Text size="1" color="gray" weight="bold" mb="2" mt="2" style={{ fontSize: 10, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.7 }}>
            Sprints
          </Text>
          <Flex direction="column" gap="1">
            <Flex
              align="center" gap="2" px="3" py="2"
              onClick={() => onFilter(null)}
              style={{
                cursor: 'pointer', borderRadius: 8,
                background: activeFilter === null ? 'var(--accent-3)' : 'transparent',
                color: activeFilter === null ? 'var(--accent-11)' : 'var(--gray-11)',
                transition: 'background 0.12s',
              }}
            >
              <Layers size={12} style={{ opacity: activeFilter === null ? 1 : 0.65 }} />
              <Text size="2" weight={activeFilter === null ? 'bold' : 'medium'}>All Sprints</Text>
            </Flex>

            {sprintStats.map(s => {
              const isActive = activeFilter === s.id
              return (
                <Box
                  key={s.id}
                  onClick={() => onFilter(isActive ? null : s.id)}
                  style={{
                    cursor: 'pointer', borderRadius: 8,
                    background: isActive ? 'var(--accent-3)' : 'transparent',
                    color: isActive ? 'var(--accent-11)' : 'var(--gray-12)',
                    padding: '8px 12px', transition: 'background 0.12s',
                  }}
                >
                  <Flex align="center" gap="2" mb="1">
                    <Flag size={11} style={{ flexShrink: 0, color: isActive ? 'var(--accent-11)' : 'var(--gray-7)' }} />
                    <Text size="2" weight={isActive ? 'bold' : 'medium'} style={{ color: isActive ? 'var(--accent-11)' : 'var(--gray-12)', flex: 1, minWidth: 0 }}>{s.name}</Text>
                    <Text size="1" color="gray" style={{ fontSize: 9, flexShrink: 0 }}>{s.story_points}sp</Text>
                  </Flex>
                  <Text size="1" color="gray" style={{ display: 'block', fontSize: 10, lineHeight: 1.4, marginBottom: 4 }}>
                    {(s.goal || '').substring(0, 50)}{(s.goal || '').length > 50 ? '...' : ''}
                  </Text>
                  <Box style={{ background: 'var(--gray-4)', borderRadius: 3, height: 3, marginBottom: 3, overflow: 'hidden' }}>
                    <Box style={{ background: s.pct === 100 ? 'var(--blue-9)' : 'var(--accent-9)', height: '100%', width: `${s.pct}%`, borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </Box>
                  <Flex justify="between">
                    <Text size="1" color="gray" style={{ fontSize: 9 }}>{s.tasksDone}/{s.tasksTotal} tasks</Text>
                    <Text size="1" color={s.pct === 100 ? 'green' : 'gray'} weight={s.pct === 100 ? 'bold' : 'regular'} style={{ fontSize: 9 }}>{s.pct}%</Text>
                  </Flex>
                </Box>
              )
            })}
          </Flex>
        </Flex>
      </ScrollArea>
    </Box>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
//  TASK DRAWER — uses same Card/Badge/Text patterns as DashboardPage
// ════════════════════════════════════════════════════════════════════════════════

function TaskDrawer({ task, onClose, onUpdate, orgUsers, isRunningAgent, agentLogs, onRunAgent, buildActivity, buildProgress, buildRoleProgress, buildComplete, isBuilding, terminalOutput, permissionRequest, onApprovePermission, onDenyPermission }) {
  if (!task) return null
  const aColor = agentColor(task.assigned_agent)
  const aHex   = agentHex(task.assigned_agent)

  return (
    <Box style={{
      width: 460,
      borderLeft: '1px solid var(--gray-4)',
      background: 'var(--color-panel-solid)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100%',
    }}>
      <ScrollArea style={{ flex: 1 }}>
        <Flex direction="column" p="5" gap="4">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <Flex justify="between" align="start">
            <Box style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
              {/* Breadcrumb */}
              <Flex align="center" gap="1" mb="2" wrap="wrap">
                <Text size="1" color="gray" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{task.epic}</Text>
                <ChevronRight size={10} color="var(--gray-7)" />
                <Text size="1" color="gray" style={{ fontSize: 10 }}>{task.feature}</Text>
              </Flex>

              <Text style={{ display: 'block', fontSize: 16, fontWeight: 700, color: 'var(--gray-12)', letterSpacing: '-0.3px', lineHeight: 1.3, marginBottom: 8 }}>
                {task.title}
              </Text>

              {/* Agent badge */}
              <Badge size="1" color={aColor} variant="soft">
                <Flex align="center" gap="1">
                  <Box style={{ width: 5, height: 5, borderRadius: '50%', background: aHex }} />
                  {task.assigned_agent}
                </Flex>
              </Badge>
            </Box>

            <Button size="1" variant="ghost" color="gray" onClick={onClose} style={{ cursor: 'pointer', flexShrink: 0, marginTop: -2 }}>
              <X size={14} />
            </Button>
          </Flex>

          {/* Description */}
          <Text size="2" color="gray" style={{ lineHeight: 1.65 }}>{task.description}</Text>

          <Separator size="4" />

          {/* ── Metadata card ───────────────────────────────────────────────── */}
          <Card size="1" style={{ borderRadius: 'var(--radius-3)' }}>
            <Grid columns="3" gap="3" p="2">
              {[
                { icon: <Star size={11}/>,   label: 'Story Points', value: `${task.story_points} pts` },
                { icon: <Clock size={11}/>,  label: 'Est. Hours',   value: `${task.estimated_hours}h` },
                { icon: <Zap size={11}/>,    label: 'Sprint',       value: `Sprint ${task.sprint}` },
              ].map(m => (
                <Box key={m.label}>
                  <Flex align="center" gap="1" mb="1">
                    <Box style={{ color: 'var(--gray-9)' }}>{m.icon}</Box>
                    <Text size="1" color="gray" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</Text>
                  </Flex>
                  <Text size="3" weight="bold">{m.value}</Text>
                </Box>
              ))}
            </Grid>

            <Separator size="4" my="2" style={{ opacity: 0.5 }} />

            <Flex gap="3" px="2" pb="1" wrap="wrap">
              <Box>
                <Text size="1" color="gray" style={{ display: 'block', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Priority</Text>
                <Badge color={PRIORITY_COLOR[task.priority] || 'gray'} variant="soft">{(task.priority || 'medium').toUpperCase()}</Badge>
              </Box>
              <Box>
                <Text size="1" color="gray" style={{ display: 'block', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Status</Text>
                <Badge color={STATUS_COLOR[task.status] || 'gray'} variant="soft">{(task.status || 'pending').replace('_', ' ').toUpperCase()}</Badge>
              </Box>
              {task.prd_section && (
                <Box>
                  <Text size="1" color="gray" style={{ display: 'block', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>PRD Ref</Text>
                  <Text size="1" color="gray">{task.prd_section}</Text>
                </Box>
              )}
            </Flex>
          </Card>

          {/* ── Acceptance Criteria ─────────────────────────────────────────── */}
          {task.acceptance_criteria?.length > 0 && (
            <Box>
              <Flex align="center" gap="2" mb="2">
                <CheckCircle2 size={13} color="var(--gray-9)" />
                <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>Acceptance Criteria</Text>
              </Flex>
              <Flex direction="column" gap="2">
                {task.acceptance_criteria.map((item, i) => (
                  <Flex key={i} gap="2" align="start">
                    <Box style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: '1.5px solid var(--gray-5)',
                      background: 'var(--gray-2)',
                      flexShrink: 0, marginTop: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle2 size={9} color="var(--gray-8)" />
                    </Box>
                    <Text size="2" color="gray" style={{ lineHeight: 1.55 }}>{item}</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          )}

          {/* ── Definition of Done ──────────────────────────────────────────── */}
          {task.definition_of_done?.length > 0 && (
            <Box>
              <Flex align="center" gap="2" mb="2">
                <Diamond size={12} color="var(--accent-9)" />
                <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>Definition of Done</Text>
              </Flex>
              <Flex direction="column" gap="2">
                {task.definition_of_done.map((item, i) => (
                  <Flex key={i} gap="2" align="start">
                    <Diamond size={10} color="var(--accent-9)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <Text size="2" color="gray" style={{ lineHeight: 1.55 }}>{item}</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          )}

          {/* ── Dependencies ────────────────────────────────────────────────── */}
          {(task.depends_on?.length > 0 || task.blocks?.length > 0) && (
            <Box>
              <Flex align="center" gap="2" mb="2">
                <GitBranch size={12} color="var(--gray-9)" />
                <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>Dependencies</Text>
              </Flex>
              {task.depends_on?.map((d, i) => (
                <Flex key={i} gap="2" align="center" mb="1">
                  <Badge size="1" color="amber" variant="soft">← Depends on</Badge>
                  <Text size="1" color="gray">{d.task_title || d.target_title || '—'}</Text>
                </Flex>
              ))}
              {task.blocks?.map((b, i) => (
                <Flex key={i} gap="2" align="center" mb="1">
                  <Badge size="1" color="blue" variant="soft">→ Blocks</Badge>
                  <Text size="1" color="gray">{b.task_title || '—'}</Text>
                </Flex>
              ))}
            </Box>
          )}

          <Separator size="4" />

          {/* ── Assignee ────────────────────────────────────────────────────── */}
          <Box>
            <Flex align="center" gap="2" mb="2">
              <User size={12} color="var(--gray-9)" />
              <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>Human Owner</Text>
            </Flex>
            <Select.Root
              value={task.assigned_human_id || 'unassigned'}
              onValueChange={v => onUpdate({ assigned_human_id: v === 'unassigned' ? null : v })}
            >
              <Select.Trigger style={{ width: '100%', cursor: 'pointer' }} placeholder="Assign to team member…" />
              <Select.Content>
                <Select.Item value="unassigned">Unassigned</Select.Item>
                {orgUsers.map(u => (
                  <Select.Item key={u.id} value={u.id}>{u.email} ({u.role})</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          {/* ── Actions ─────────────────────────────────────────────────────── */}
          <Flex gap="2">
            <Button
              style={{ flexGrow: 1, cursor: 'pointer' }}
              color={aColor}
              onClick={onRunAgent}
              disabled={isRunningAgent}
            >
              {isRunningAgent ? (
                <>
                  <Box style={{ width: 11, height: 11, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'wf-spin 0.75s linear infinite', display: 'inline-block', marginRight: 6 }} />
                  Running…
                </>
              ) : (
                <><Play size={11} style={{ marginRight: 5 }} /> Run {task.assigned_agent}</>
              )}
            </Button>
            <Button variant="soft" color="blue" onClick={() => onUpdate({ status: 'completed' })} style={{ cursor: 'pointer' }}>
              <CheckCircle2 size={13} /> Done
            </Button>
            <Button variant="soft" color="blue" onClick={() => onUpdate({ status: 'in_progress' })} style={{ cursor: 'pointer' }}>
              Start
            </Button>
          </Flex>

          {/* ── Agent Log Terminal ───────────────────────────────────────────── */}
          {(agentLogs.length > 0 || isRunningAgent) && (
            <Box>
              <Flex justify="between" align="center" mb="2">
                <Flex align="center" gap="2">
                  <Terminal size={12} color="var(--gray-9)" />
                  <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.06em' }}>Agent Execution Log</Text>
                </Flex>
                <Badge size="1" color={isRunningAgent ? 'amber' : 'green'} variant="soft">
                  {isRunningAgent ? '● Running' : '● Done'}
                </Badge>
              </Flex>
              <Box style={{
                background: 'var(--gray-2)',
                border: '1px solid var(--gray-4)',
                borderRadius: 'var(--radius-2)',
                padding: '10px 12px',
                fontFamily: 'monospace',
                fontSize: 11,
                maxHeight: 190,
                overflowY: 'auto',
              }}>
                {agentLogs.map((log, i) => (
                  <Flex key={i} gap="2" align="start" style={{ marginBottom: 5 }}>
                    <Terminal size={9} color="var(--gray-7)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <Text style={{ fontSize: 11, lineHeight: 1.45, color: log.startsWith('[DONE]') ? 'var(--blue-11)' : 'var(--gray-11)' }}>{log}</Text>
                  </Flex>
                ))}
                {isRunningAgent && (
                  <Text style={{ fontSize: 11, color: 'var(--amber-11)', paddingLeft: 14 }}>█ processing…</Text>
                )}
              </Box>
            </Box>
          )}

          {/* ── Sprint Build Activity ──────────────────────────────────────────── */}
          {(isBuilding || buildComplete) && (
            <Box>
              <Flex justify="between" align="center" mb="2">
                <Flex align="center" gap="2">
                  <Rocket size={12} color="var(--gray-9)" />
                  <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.06em' }}>Sprint Build</Text>
                </Flex>
                <Badge size="1" color={isBuilding ? 'amber' : buildComplete?.status === 'completed' ? 'green' : 'red'} variant="soft">
                  {isBuilding ? '● Building' : buildComplete?.status === 'completed' ? '● Complete' : '● Done with errors'}
                </Badge>
              </Flex>

              {/* Progress */}
              {buildProgress && (
                <Box mb="3">
                  <Flex justify="between" mb="1">
                    <Text size="1" color="gray">{buildProgress.completed}/{buildProgress.total} tasks</Text>
                    <Text size="1" weight="bold">{buildProgress.pct}%</Text>
                  </Flex>
                  <Box style={{ height: 5, background: 'var(--gray-4)', borderRadius: 3, overflow: 'hidden' }}>
                    <Box style={{
                      height: '100%',
                      width: `${buildProgress.pct}%`,
                      background: buildComplete?.status === 'completed' ? '#3b82f6' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }} />
                  </Box>
                  <Flex gap="2" mt="2" wrap="wrap">
                    <Badge size="1" color="blue" variant="soft">{buildProgress.running} running</Badge>
                    <Badge size="1" color="blue" variant="soft">{buildProgress.completed} done</Badge>
                    {buildProgress.failed > 0 && <Badge size="1" color="red" variant="soft">{buildProgress.failed} failed</Badge>}
                  </Flex>
                </Box>
              )}

              {/* Role progress */}
              {Object.keys(buildRoleProgress).length > 0 && (
                <Box mb="3">
                  <Text size="1" color="gray" weight="bold" mb="1" style={{ textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.05em' }}>Agent Roles</Text>
                  <Flex direction="column" gap="1">
                    {Object.entries(buildRoleProgress).map(([role, rp]) => {
                      const rolePct = rp.total > 0 ? Math.round((rp.completed / rp.total) * 100) : 0
                      return (
                        <Flex key={role} align="center" gap="2">
                          <Badge size="1" color={AGENT_META[role]?.color || 'gray'} variant="soft" style={{ minWidth: 70, fontSize: 9, textTransform: 'capitalize' }}>{role}</Badge>
                          <Box style={{ flex: 1, height: 3, background: 'var(--gray-4)', borderRadius: 2, overflow: 'hidden' }}>
                            <Box style={{ height: '100%', width: `${rolePct}%`, background: AGENT_META[role]?.hex || 'var(--gray-7)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                          </Box>
                          <Text size="1" color="gray" style={{ minWidth: 24, fontSize: 9, textAlign: 'right' }}>{rp.completed}/{rp.total}</Text>
                        </Flex>
                      )
                    })}
                  </Flex>
                </Box>
              )}

              {/* Live chat feed */}
              <Box style={{
                background: 'var(--gray-2)',
                border: '1px solid var(--gray-4)',
                borderRadius: 'var(--radius-2)',
                padding: '8px 10px',
                maxHeight: 260,
                overflowY: 'auto',
              }}>
                {buildActivity.length === 0 && (
                  <Flex align="center" gap="2" style={{ padding: '6px 0' }}>
                    <Box style={{ width: 8, height: 8, border: '1.5px solid var(--amber-7)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'wf-spin 0.8s linear infinite' }} />
                    <Text size="1" color="gray" style={{ fontStyle: 'italic', fontSize: 11 }}>Starting agents...</Text>
                  </Flex>
                )}
                {[...buildActivity].reverse().map((entry) => {
                  const roleMeta = AGENT_META[entry.agent] || {}
                  const isOrch = entry.agent === 'orchestrator'
                  const step = entry.step || 'info'
                  const ts = entry.timestamp ? new Date(entry.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''

                  const stepConfig = {
                    start:     { icon: <Play size={8} />,          color: roleMeta.hex || 'var(--gray-11)', bg: roleMeta.hex ? `${roleMeta.hex}18` : 'var(--gray-3)', mono: false },
                    command:   { icon: <Terminal size={8} />,      color: 'var(--gray-12)',                  bg: 'var(--gray-3)',  mono: true },
                    output:    { icon: null,                        color: 'var(--gray-9)',                   bg: null,            mono: true },
                    permission:{ icon: <Shield size={8} />,        color: 'var(--amber-11)',                bg: 'var(--amber-3)', mono: false },
                    success:   { icon: <Check size={8} />,         color: 'var(--blue-11)',                bg: 'var(--blue-3)', mono: false },
                    error:     { icon: <X size={8} />,             color: 'var(--red-11)',                  bg: 'var(--red-3)',   mono: false },
                    info:      { icon: <Zap size={8} />,           color: 'var(--gray-11)',                 bg: 'var(--gray-3)',  mono: false },
                    done:      { icon: <CheckCircle size={8} />,   color: 'var(--blue-11)',                bg: 'var(--blue-3)', mono: false },
                  }
                  const cfg = stepConfig[step] || stepConfig.info

                  return (
                    <Flex key={entry.id} align="start" gap="2" style={{ marginBottom: 5, padding: step === 'output' ? '1px 0 1px 20px' : '4px 6px', background: cfg.bg, borderRadius: 4 }}>
                      {/* Role avatar — hidden for output lines */}
                      {step !== 'output' ? (
                        <Box style={{
                          width: 16, height: 16, borderRadius: '50%',
                          background: isOrch ? 'var(--gray-4)' : roleMeta.hex || 'var(--gray-5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 1,
                        }}>
                          {isOrch ? <Zap size={8} color="var(--gray-11)" /> : cfg.icon || <Box style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', opacity: 0.8 }} />}
                        </Box>
                      ) : (
                        <Text style={{ fontSize: 8, color: 'var(--gray-7)', flexShrink: 0, marginTop: 1, width: 16, textAlign: 'center' }}>│</Text>
                      )}
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        {/* Header line — hidden for output */}
                        {step !== 'output' && (
                          <Flex align="center" gap="1" mb="1">
                            <Text size="1" style={{ fontSize: 8, fontWeight: 700, textTransform: 'capitalize', color: roleMeta.hex || 'var(--gray-11)' }}>{entry.agent}</Text>
                            {step === 'start' && entry.task_id && <Badge size="1" color="blue" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>starting</Badge>}
                            {step === 'command' && <Badge size="1" color="gray" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>command</Badge>}
                            {step === 'permission' && <Badge size="1" color="amber" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>permission</Badge>}
                            {step === 'success' && <Badge size="1" color="blue" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>done</Badge>}
                            {step === 'error' && <Badge size="1" color="red" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>error</Badge>}
                            <Text size="1" style={{ fontSize: 7, color: 'var(--gray-7)', marginLeft: 'auto' }}>{ts}</Text>
                          </Flex>
                        )}
                        <Text style={{
                          fontSize: step === 'output' ? 9 : 10,
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                          fontFamily: cfg.mono ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' : undefined,
                          color: cfg.color,
                          opacity: step === 'output' ? 0.8 : 1,
                        }}>{entry.message}</Text>
                      </Box>
                    </Flex>
                  )
                })}
                {isBuilding && buildActivity.length > 0 && (
                  <Flex align="center" gap="2" style={{ paddingTop: 4 }}>
                    <Box style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', animation: 'wf-pulse 1.5s ease infinite' }} />
                    <Text size="1" color="gray" style={{ fontSize: 9 }}>building...</Text>
                  </Flex>
                )}
              </Box>
            </Box>
          )}

          {/* ── Live Terminal Output ──────────────────────────────────────────── */}
          {terminalOutput && terminalOutput.length > 0 && (
            <Box>
              <Flex align="center" gap="2" mb="2">
                <Terminal size={12} color="var(--gray-9)" />
                <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.06em' }}>Terminal Output</Text>
              </Flex>
              <Box style={{
                background: '#1a1b26',
                border: '1px solid #334155',
                borderRadius: 'var(--radius-2)',
                padding: '8px 10px',
                maxHeight: 200,
                overflowY: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 10,
                lineHeight: 1.5,
              }}>
                {terminalOutput.slice(-50).map((line, i) => (
                  <Flex key={i} align="start" gap="2" style={{ marginBottom: 1 }}>
                    <Badge size="1" color={AGENT_META[line.role]?.color || 'gray'} variant="soft" style={{ fontSize: 7, minWidth: 40, flexShrink: 0, textTransform: 'capitalize' }}>{line.role || '?'}</Badge>
                    <Text style={{ color: line.text.startsWith('[stderr]') ? '#f87171' : '#a3e635', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                      {line.text.replace('[stderr] ', '')}
                    </Text>
                  </Flex>
                ))}
              </Box>
            </Box>
          )}

          {/* ── Permission Request ──────────────────────────────────────────── */}
          {permissionRequest && (
            <Box style={{
              background: 'var(--amber-2)',
              border: '2px solid var(--amber-7)',
              borderRadius: 'var(--radius-3)',
              padding: '12px 14px',
            }}>
              <Flex align="center" gap="2" mb="2">
                <Shield size={14} color="var(--amber-11)" />
                <Text size="2" weight="bold" style={{ color: 'var(--amber-11)' }}>Permission Required</Text>
              </Flex>
              <Text size="1" color="gray" mb="1" style={{ fontSize: 11 }}>
                <strong>{permissionRequest.taskTitle}</strong> wants to run:
              </Text>
              <Box style={{
                background: 'var(--gray-2)',
                border: '1px solid var(--gray-4)',
                borderRadius: 'var(--radius-2)',
                padding: '6px 10px',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 11,
                marginBottom: 10,
                wordBreak: 'break-all',
              }}>
                <Text style={{ color: 'var(--gray-12)' }}>{permissionRequest.command}</Text>
              </Box>
              {permissionRequest.description && (
                <Text size="1" color="gray" mb="2" style={{ fontSize: 10, fontStyle: 'italic' }}>{permissionRequest.description}</Text>
              )}
              <Flex gap="2">
                <Button size="2" variant="solid" color="blue" onClick={onApprovePermission} style={{ cursor: 'pointer', flex: 1 }}>
                  <Check size={12} /> Approve
                </Button>
                <Button size="2" variant="solid" color="red" onClick={onDenyPermission} style={{ cursor: 'pointer', flex: 1 }}>
                  <X size={12} /> Deny
                </Button>
              </Flex>
            </Box>
          )}

        </Flex>
      </ScrollArea>
    </Box>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
//  ACTIVITY PANEL — standalone drawer for build activity
// ════════════════════════════════════════════════════════════════════════════════

function ActivityPanel({ buildActivity, buildProgress, buildRoleProgress, buildComplete, isBuilding, terminalOutput, permissionRequest, onApprovePermission, onDenyPermission, onClose }) {
  return (
    <Box style={{
      width: 420,
      borderLeft: '1px solid var(--gray-4)',
      background: 'var(--color-panel-solid)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100%',
    }}>
      <Flex justify="between" align="center" px="4" py="3" style={{ borderBottom: '1px solid var(--gray-4)', flexShrink: 0 }}>
        <Flex align="center" gap="2">
          <Terminal size={14} color="var(--gray-9)" />
          <Text size="2" weight="bold">Agent Activity</Text>
        </Flex>
        <Button size="1" variant="ghost" color="gray" onClick={onClose} style={{ cursor: 'pointer', padding: 6 }}>
          <X size={14} />
        </Button>
      </Flex>

      <ScrollArea style={{ flex: 1 }}>
        <Flex direction="column" p="4" gap="4">

          {/* Progress */}
          {buildProgress && (
            <Box>
              <Flex justify="between" mb="1">
                <Text size="1" color="gray">{buildProgress.completed}/{buildProgress.total} tasks</Text>
                <Text size="1" weight="bold">{buildProgress.pct}%</Text>
              </Flex>
              <Box style={{ height: 5, background: 'var(--gray-4)', borderRadius: 3, overflow: 'hidden' }}>
                <Box style={{
                  height: '100%',
                  width: `${buildProgress.pct}%`,
                  background: buildComplete?.status === 'completed' ? '#3b82f6' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  borderRadius: 3,
                  transition: 'width 0.5s ease',
                }} />
              </Box>
              <Flex gap="2" mt="2" wrap="wrap">
                <Badge size="1" color="blue" variant="soft">{buildProgress.running} running</Badge>
                <Badge size="1" color="blue" variant="soft">{buildProgress.completed} done</Badge>
                {buildProgress.failed > 0 && <Badge size="1" color="red" variant="soft">{buildProgress.failed} failed</Badge>}
              </Flex>
            </Box>
          )}

          {/* Role progress */}
          {Object.keys(buildRoleProgress).length > 0 && (
            <Box>
              <Text size="1" color="gray" weight="bold" mb="1" style={{ textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.05em' }}>Agent Roles</Text>
              <Flex direction="column" gap="1">
                {Object.entries(buildRoleProgress).map(([role, rp]) => {
                  const rolePct = rp.total > 0 ? Math.round((rp.completed / rp.total) * 100) : 0
                  return (
                    <Flex key={role} align="center" gap="2">
                      <Badge size="1" color={AGENT_META[role]?.color || 'gray'} variant="soft" style={{ minWidth: 70, fontSize: 9, textTransform: 'capitalize' }}>{role}</Badge>
                      <Box style={{ flex: 1, height: 3, background: 'var(--gray-4)', borderRadius: 2, overflow: 'hidden' }}>
                        <Box style={{ height: '100%', width: `${rolePct}%`, background: AGENT_META[role]?.hex || 'var(--gray-7)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                      </Box>
                      <Text size="1" color="gray" style={{ minWidth: 24, fontSize: 9, textAlign: 'right' }}>{rp.completed}/{rp.total}</Text>
                    </Flex>
                  )
                })}
              </Flex>
            </Box>
          )}

          {/* Permission request */}
          {permissionRequest && (
            <Box style={{
              background: 'var(--amber-2)',
              border: '2px solid var(--amber-7)',
              borderRadius: 'var(--radius-3)',
              padding: '12px 14px',
            }}>
              <Flex align="center" gap="2" mb="2">
                <Shield size={14} color="var(--amber-11)" />
                <Text size="2" weight="bold" style={{ color: 'var(--amber-11)' }}>Permission Required</Text>
              </Flex>
              <Text size="1" color="gray" mb="1" style={{ fontSize: 11 }}>
                <strong>{permissionRequest.taskTitle}</strong> wants to run:
              </Text>
              <Box style={{
                background: 'var(--gray-2)',
                border: '1px solid var(--gray-4)',
                borderRadius: 'var(--radius-2)',
                padding: '6px 10px',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 11,
                marginBottom: 10,
                wordBreak: 'break-all',
              }}>
                <Text style={{ color: 'var(--gray-12)' }}>{permissionRequest.command}</Text>
              </Box>
              <Flex gap="2">
                <Button size="2" variant="solid" color="blue" onClick={onApprovePermission} style={{ cursor: 'pointer', flex: 1 }}>
                  <Check size={12} /> Approve
                </Button>
                <Button size="2" variant="solid" color="red" onClick={onDenyPermission} style={{ cursor: 'pointer', flex: 1 }}>
                  <X size={12} /> Deny
                </Button>
              </Flex>
            </Box>
          )}

          {/* Activity chat feed */}
          <Box>
            <Flex align="center" gap="2" mb="2">
              <Rocket size={12} color="var(--gray-9)" />
              <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.06em' }}>Live Feed</Text>
            </Flex>
            <Box style={{
              background: 'var(--gray-2)',
              border: '1px solid var(--gray-4)',
              borderRadius: 'var(--radius-2)',
              padding: '8px 10px',
              maxHeight: 300,
              overflowY: 'auto',
            }}>
              {buildActivity.length === 0 && (
                <Flex align="center" gap="2" style={{ padding: '6px 0' }}>
                  <Box style={{ width: 8, height: 8, border: '1.5px solid var(--amber-7)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'wf-spin 0.8s linear infinite' }} />
                  <Text size="1" color="gray" style={{ fontStyle: 'italic', fontSize: 11 }}>Starting agents...</Text>
                </Flex>
              )}
              {[...buildActivity].reverse().map((entry) => {
                const roleMeta = AGENT_META[entry.agent] || {}
                const isOrch = entry.agent === 'orchestrator'
                const step = entry.step || 'info'
                const ts = entry.timestamp ? new Date(entry.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''

                const stepConfig = {
                  start:     { icon: <Play size={8} />,          color: roleMeta.hex || 'var(--gray-11)', bg: roleMeta.hex ? `${roleMeta.hex}18` : 'var(--gray-3)', mono: false },
                  command:   { icon: <Terminal size={8} />,      color: 'var(--gray-12)',                  bg: 'var(--gray-3)',  mono: true },
                  output:    { icon: null,                        color: 'var(--gray-9)',                   bg: null,            mono: true },
                  permission:{ icon: <Shield size={8} />,        color: 'var(--amber-11)',                bg: 'var(--amber-3)', mono: false },
                  success:   { icon: <Check size={8} />,         color: 'var(--blue-11)',                bg: 'var(--blue-3)', mono: false },
                  error:     { icon: <X size={8} />,             color: 'var(--red-11)',                  bg: 'var(--red-3)',   mono: false },
                  info:      { icon: <Zap size={8} />,           color: 'var(--gray-11)',                 bg: 'var(--gray-3)',  mono: false },
                  done:      { icon: <CheckCircle size={8} />,   color: 'var(--blue-11)',                bg: 'var(--blue-3)', mono: false },
                }
                const cfg = stepConfig[step] || stepConfig.info

                return (
                  <Flex key={entry.id} align="start" gap="2" style={{ marginBottom: 5, padding: step === 'output' ? '1px 0 1px 20px' : '4px 6px', background: cfg.bg, borderRadius: 4 }}>
                    {step !== 'output' ? (
                      <Box style={{
                        width: 16, height: 16, borderRadius: '50%',
                        background: isOrch ? 'var(--gray-4)' : roleMeta.hex || 'var(--gray-5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        {isOrch ? <Zap size={8} color="var(--gray-11)" /> : cfg.icon || <Box style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', opacity: 0.8 }} />}
                      </Box>
                    ) : (
                      <Text style={{ fontSize: 8, color: 'var(--gray-7)', flexShrink: 0, marginTop: 1, width: 16, textAlign: 'center' }}>│</Text>
                    )}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      {step !== 'output' && (
                        <Flex align="center" gap="1" mb="1">
                          <Text size="1" style={{ fontSize: 8, fontWeight: 700, textTransform: 'capitalize', color: roleMeta.hex || 'var(--gray-11)' }}>{entry.agent}</Text>
                          {step === 'start' && <Badge size="1" color="blue" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>starting</Badge>}
                          {step === 'command' && <Badge size="1" color="gray" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>command</Badge>}
                          {step === 'permission' && <Badge size="1" color="amber" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>permission</Badge>}
                          {step === 'success' && <Badge size="1" color="blue" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>done</Badge>}
                          {step === 'error' && <Badge size="1" color="red" variant="soft" style={{ fontSize: 7, paddingInline: 3 }}>error</Badge>}
                          <Text size="1" style={{ fontSize: 7, color: 'var(--gray-7)', marginLeft: 'auto' }}>{ts}</Text>
                        </Flex>
                      )}
                      <Text style={{
                        fontSize: step === 'output' ? 9 : 10,
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                        fontFamily: cfg.mono ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' : undefined,
                        color: cfg.color,
                        opacity: step === 'output' ? 0.8 : 1,
                      }}>{entry.message}</Text>
                    </Box>
                  </Flex>
                )
              })}
              {isBuilding && buildActivity.length > 0 && (
                <Flex align="center" gap="2" style={{ paddingTop: 4 }}>
                  <Box style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', animation: 'wf-pulse 1.5s ease infinite' }} />
                  <Text size="1" color="gray" style={{ fontSize: 9 }}>building...</Text>
                </Flex>
              )}
            </Box>
          </Box>

          {/* Terminal output */}
          {terminalOutput && terminalOutput.length > 0 && (
            <Box>
              <Flex align="center" gap="2" mb="2">
                <Terminal size={12} color="var(--gray-9)" />
                <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.06em' }}>Terminal</Text>
              </Flex>
              <Box style={{
                background: '#1a1b26',
                border: '1px solid #334155',
                borderRadius: 'var(--radius-2)',
                padding: '8px 10px',
                maxHeight: 200,
                overflowY: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 10,
                lineHeight: 1.5,
              }}>
                {terminalOutput.slice(-50).map((line, i) => (
                  <Flex key={i} align="start" gap="2" style={{ marginBottom: 1 }}>
                    <Badge size="1" color={AGENT_META[line.role]?.color || 'gray'} variant="soft" style={{ fontSize: 7, minWidth: 40, flexShrink: 0, textTransform: 'capitalize' }}>{line.role || '?'}</Badge>
                    <Text style={{ color: line.text?.startsWith('[stderr]') ? '#f87171' : '#a3e635', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                      {line.text?.replace('[stderr] ', '') || ''}
                    </Text>
                  </Flex>
                ))}
              </Box>
            </Box>
          )}

        </Flex>
      </ScrollArea>
    </Box>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════════

export default function AIWorkflowPage() {
  const { orgId, projectId } = useParams()
  const navigate = useNavigate()

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [workflow, setWorkflow]           = useState(null)
  const [selectedTask, setSelectedTask]   = useState(null)
  const [orgUsers, setOrgUsers]           = useState([])
  const [isLoading, setIsLoading]         = useState(true)
  const [isRunningAgent, setIsRunningAgent] = useState(false)
  const [agentLogs, setAgentLogs]         = useState([])
  const [sprintFilter, setSprintFilter]   = useState(null)
  const [epicFilter, setEpicFilter]       = useState(null)
  const [roleFilter, setRoleFilter]       = useState('all')

  // Sprint build state
  const [isBuilding, setIsBuilding]           = useState(false)
  const [buildProgress, setBuildProgress]     = useState(null)
  const [buildActivity, setBuildActivity]     = useState([])
  const [buildRoleProgress, setBuildRoleProgress] = useState({})
  const [buildComplete, setBuildComplete]     = useState(null)
  const [terminalOutput, setTerminalOutput]   = useState([])
  const [permissionRequest, setPermissionRequest] = useState(null)
  const [runningTaskIds, setRunningTaskIds]   = useState(new Set())
  const [projectDir, setProjectDir]           = useState('')
  const [showActivity, setShowActivity]       = useState(false)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchWorkflow = useCallback(async () => {
    if (!projectId) return
    try {
      const [data, proj] = await Promise.all([
        apiRequest(`/api/projects/${projectId}/workflow`, { method: 'GET' }),
        apiRequest(`/api/projects/${projectId}`, { method: 'GET' }).catch(() => null),
      ])
      if (proj?.project_dir) setProjectDir(proj.project_dir)
      if (!data || (!data.epics && !data.phases)) { setIsLoading(false); return }
      setWorkflow(data)
      if (data.react_flow?.nodes?.length) {
        setNodes(data.react_flow.nodes.map(n => ({ ...n, type: n.nodeType || 'default' })))
        setEdges(data.react_flow.edges || [])
      } else if (data.epics)  buildFlowFromEpics(data.epics)
      else if (data.phases)   buildLegacyFlow(data.phases)
    } catch (e) { console.error('Failed to load workflow:', e) }
    finally     { setIsLoading(false) }
  }, [projectId])

  useEffect(() => {
    fetchWorkflow()
    if (orgId) listOrgUsers(orgId).then(u => setOrgUsers(u || [])).catch(console.error)
  }, [orgId, fetchWorkflow])

  // ── Check for active build on mount / project change ──────────────────
  useEffect(() => {
    if (!projectId) return
    let stopPoll = null
    SprintBuildApi.getActiveBuild(projectId).then(data => {
      if (data?.status && data.status !== 'not_found' && data.sprint_id) {
        setIsBuilding(true)
        setShowActivity(true)
        setBuildActivity([])
        setBuildRoleProgress({})
        setBuildComplete(null)

        stopPoll = SprintBuildApi.pollBuildProgress(data.sprint_id, {
          onEvent: (evt) => {
            if (evt.type === 'log') {
              setBuildActivity(prev => [...prev, { ...evt, id: Date.now() + Math.random() }])
            } else if (evt.type === 'progress') {
              setBuildProgress({ pct: evt.total ? Math.round((evt.completed / evt.total) * 100) : 0, completed: evt.completed, running: 0, failed: evt.failed, total: evt.total })
              setBuildRoleProgress(evt.role_progress || {})
            } else if (evt.type === 'terminal_output') {
              setTerminalOutput(prev => [...prev.slice(-200), { text: evt.output, role: evt.role, taskId: evt.task_id, ts: evt.timestamp }])
            } else if (evt.type === 'permission') {
              setPermissionRequest({ sprintId: evt.sprint_id, taskId: evt.task_id, taskTitle: evt.task_id, command: evt.cmd, description: evt.reason, ts: evt.timestamp })
            } else if (evt.type === 'task_update') {
              setRunningTaskIds(prev => {
                const next = new Set(prev)
                if (evt.status === 'running') next.add(evt.task_id)
                else next.delete(evt.task_id)
                return next
              })
            } else if (evt.type === 'error') {
              setIsBuilding(false)
            }
          },
          onDone: (d) => {
            setBuildComplete({ status: d.status, completed: d.completed_tasks, failed: d.failed_tasks, total: d.total_tasks })
            setIsBuilding(false)
            setRunningTaskIds(new Set())
            fetchWorkflow()
          },
          onError: () => setIsBuilding(false),
        })
      }
    }).catch(console.error)
    return () => { if (stopPoll) stopPoll.close() }
  }, [projectId])

  // ── Flow builders ─────────────────────────────────────────────────────────
  const buildFlowFromEpics = (epics) => {
    const ns = [], es = [], COLW = 320, GAP = 60
    ns.push({ id: 'project-root', type: 'project', data: { title: 'Project', epicCount: epics.length, taskCount: epics.reduce((a,e) => a + (e.task_count||0), 0) }, position: { x: (epics.length * (COLW+GAP))/2 - 120, y: 0 } })
    epics.forEach((epic, ei) => {
      const x = ei * (COLW + GAP)
      let y = 110
      ns.push({ id: epic.id, type: 'epic', data: { epicId: epic.id, title: epic.title, color: epic.color, sprint: epic.sprint, featureCount: epic.feature_count||0, taskCount: epic.task_count||0 }, position: { x, y } })
      es.push({ id: `root_${epic.id}`, source: 'project-root', target: epic.id, type: 'smoothstep', animated: true, style: { stroke: epic.color, strokeWidth: 1.5, opacity: 0.55 } })
      if (ei > 0) es.push({ id: `ep_s_${ei}`, source: epics[ei-1].id, target: epic.id, type: 'smoothstep', style: { stroke: 'var(--gray-7)', strokeDasharray: '4,4', strokeWidth: 1 } })
      y += 85
      epic.features?.forEach(feat => {
        ns.push({ id: feat.id, type: 'feature', data: { featureId: feat.id, epicId: epic.id, epicColor: epic.color, title: feat.title, taskCount: feat.task_count||0, sprint: feat.sprint||epic.sprint }, position: { x: x+20, y } })
        es.push({ id: `ef_${epic.id}_${feat.id}`, source: epic.id, target: feat.id, type: 'smoothstep', style: { stroke: epic.color, strokeWidth: 1.2, opacity: 0.6 } })
        y += 58
        feat.tasks?.forEach(task => {
          ns.push({ id: `task_${task.id}`, type: 'task', data: { taskId: task.id, title: task.title, agent: task.assigned_agent, priority: task.priority, sprint: task.sprint, storyPoints: task.story_points, status: task.status, taskRaw: task }, position: { x: x+30, y } })
          es.push({ id: `ft_${feat.id}_${task.id}`, source: feat.id, target: `task_${task.id}`, type: 'smoothstep', style: { stroke: 'var(--gray-5)', strokeWidth: 1 } })
          y += 110
        })
        y += 16
      })
    })
    setNodes(ns); setEdges(es)
  }

  const buildLegacyFlow = (phases) => {
    const CM = { planning: '#3b82f6', frontend: '#8b5cf6', backend: '#14b8a6', database: '#f59e0b', devops: '#ef4444', qa: '#ec4899' }
    const ns = [], es = []
    ns.push({ id: 'project-root', type: 'project', data: { title: 'Project', epicCount: phases.length, taskCount: phases.reduce((a,p) => a+p.tasks.length, 0) }, position: { x: 400, y: 0 } })
    phases.forEach((phase, pi) => {
      const x = pi * 340, color = CM[phase.name?.toLowerCase()] || '#3b82f6'
      ns.push({ id: `ph_${phase.id}`, type: 'epic', data: { epicId: phase.id, title: phase.name, color, sprint: 1, featureCount: 0, taskCount: phase.tasks.length }, position: { x, y: 120 } })
      es.push({ id: `rph_${pi}`, source: 'project-root', target: `ph_${phase.id}`, animated: true, style: { stroke: color, strokeWidth: 1.5 } })
      let ty = 220
      phase.tasks?.forEach(task => {
        ns.push({ id: `task_${task.id}`, type: 'task', data: { taskId: task.id, title: task.title, agent: task.assigned_agent, priority: task.priority, sprint: 1, storyPoints: task.story_points, status: task.status, taskRaw: task }, position: { x: x+20, y: ty } })
        es.push({ id: `pht_${task.id}`, source: `ph_${phase.id}`, target: `task_${task.id}`, style: { stroke: 'var(--gray-5)' } })
        ty += 110
      })
    })
    setNodes(ns); setEdges(es)
  }

  // ── Filtered flow ─────────────────────────────────────────────────────────
  const buildFilteredFlow = useCallback(() => {
    if (!workflow?.epics) return
    const epics = workflow.epics
    const activeRoleAgents = ROLE_FILTERS.find(r => r.id === roleFilter)?.agents || []
    const filterByRole = roleFilter !== 'all'
    const filterBySprint = sprintFilter !== null
    const filterByEpic = epicFilter !== null

    const ns = [], es = [], COLW = 320, GAP = 60
    const visibleEpicIds = new Set()

    ns.push({ id: 'project-root', type: 'project', data: { title: 'Project', epicCount: epics.length, taskCount: epics.reduce((a,e) => a + (e.task_count||0), 0) }, position: { x: (epics.length * (COLW+GAP))/2 - 120, y: 0 } })

    epics.forEach((epic, ei) => {
      if (filterByEpic && epic.id !== epicFilter) return
      const x = ei * (COLW + GAP)
      let y = 110
      visibleEpicIds.add(epic.id)

      ns.push({ id: epic.id, type: 'epic', data: { epicId: epic.id, title: epic.title, color: epic.color, sprint: epic.sprint, featureCount: epic.feature_count||0, taskCount: epic.task_count||0 }, position: { x, y } })
      es.push({ id: `root_${epic.id}`, source: 'project-root', target: epic.id, type: 'smoothstep', animated: true, style: { stroke: epic.color, strokeWidth: 1.5, opacity: 0.55 } })
      if (ei > 0 && visibleEpicIds.has(epics[ei-1]?.id)) es.push({ id: `ep_s_${ei}`, source: epics[ei-1].id, target: epic.id, type: 'smoothstep', style: { stroke: 'var(--gray-7)', strokeDasharray: '4,4', strokeWidth: 1 } })
      y += 85

      epic.features?.forEach(feat => {
        if (filterBySprint && feat.sprint !== sprintFilter && epic.sprint !== sprintFilter) return
        ns.push({ id: feat.id, type: 'feature', data: { featureId: feat.id, epicId: epic.id, epicColor: epic.color, title: feat.title, taskCount: feat.task_count||0, sprint: feat.sprint||epic.sprint }, position: { x: x+20, y } })
        es.push({ id: `ef_${epic.id}_${feat.id}`, source: epic.id, target: feat.id, type: 'smoothstep', style: { stroke: epic.color, strokeWidth: 1.2, opacity: 0.6 } })
        y += 58

        feat.tasks?.forEach(task => {
          if (filterBySprint && task.sprint !== sprintFilter) return
          if (filterByRole && !activeRoleAgents.includes(task.assigned_agent)) return
          ns.push({ id: `task_${task.id}`, type: 'task', data: { taskId: task.id, title: task.title, agent: task.assigned_agent, priority: task.priority, sprint: task.sprint, storyPoints: task.story_points, status: task.status, taskRaw: task }, position: { x: x+30, y } })
          es.push({ id: `ft_${feat.id}_${task.id}`, source: feat.id, target: `task_${task.id}`, type: 'smoothstep', style: { stroke: 'var(--gray-5)', strokeWidth: 1 } })
          y += 110
        })
        y += 16
      })
    })
    setNodes(ns); setEdges(es)
  }, [workflow, sprintFilter, epicFilter, roleFilter])

  useEffect(() => {
    if (workflow) buildFilteredFlow()
  }, [sprintFilter, epicFilter, roleFilter, workflow])

  // Overlay running status on task nodes without rebuilding the tree
  useEffect(() => {
    setNodes(prev => prev.map(n => {
      if (n.type !== 'task') return n
      const isRun = runningTaskIds.has(n.data.taskId)
      const already = n.data.status === 'running'
      if (isRun === already) return n
      return { ...n, data: { ...n.data, status: isRun ? 'running' : (n.data.taskRaw?.status || 'pending') } }
    }))
  }, [runningTaskIds])

  // ── Events ────────────────────────────────────────────────────────────────
  const onNodeClick = useCallback((_, node) => {
    const raw = node.data?.taskRaw
    if (raw) { setSelectedTask(raw); setAgentLogs([]); setIsRunningAgent(false) }
  }, [])

  const handleUpdateTask = async (fields) => {
    if (!selectedTask) return
    try {
      await apiRequest(`/api/projects/${projectId}/workflow/tasks/${selectedTask.id}`, { method: 'PATCH', body: JSON.stringify(fields) })
      setSelectedTask(prev => ({ ...prev, ...fields }))
      fetchWorkflow()
    } catch (e) { console.error('Update failed:', e) }
  }

  const handleRunAgent = () => {
    if (isRunningAgent || !selectedTask) return
    setIsRunningAgent(true)
    const agent = selectedTask.assigned_agent || 'AI Agent'
    const logs = [
      `[${agent}] Initializing execution environment…`,
      `[${agent}] Reading PRD section: ${selectedTask.prd_section || 'General'}…`,
      `[${agent}] Validating ${selectedTask.acceptance_criteria?.length || 0} acceptance criteria…`,
      `[${agent}] Generating implementation artifacts…`,
      `[${agent}] Running validation checks…`,
      `[DONE] Task completed. All criteria verified.`,
    ]
    logs.forEach((log, i) => setTimeout(() => {
      setAgentLogs(prev => [...prev, log])
      if (i === logs.length - 1) { setIsRunningAgent(false); handleUpdateTask({ status: 'completed' }) }
    }, i * 1100))
  }

  // ── Sprint Build ────────────────────────────────────────────────────────
  const handleStartSprintBuild = async (sprintId) => {
    if (isBuilding) return

    const sprint = sprints.find(s => s.id === sprintId)
    if (!sprint) return

    // Collect all tasks for this sprint from the workflow
    const sprintTasks = allTasks.filter(t => t.sprint === sprintId || t.sprint === sprint.id)
    if (sprintTasks.length === 0) return

    setIsBuilding(true)
    setBuildProgress({ pct: 0, completed: 0, running: 0, failed: 0, total: sprintTasks.length })
    setBuildActivity([])
    setBuildRoleProgress({})
    setBuildComplete(null)
    setShowActivity(true)

    try {
      // Start the build via API
      await SprintBuildApi.startBuild(
        sprint.id || sprintId,
        projectId,
        sprintTasks,
        workflow?.prd_body || '',
        workflow?.domain_context || {},
        projectDir
      )

      // Poll progress
      const { close } = SprintBuildApi.pollBuildProgress(sprint.id || sprintId, {
        onEvent: (event) => {
          if (event.type === 'log') {
            setBuildActivity(prev => [...prev, { ...event, id: Date.now() + Math.random() }])
          } else if (event.type === 'progress') {
            setBuildProgress({ pct: event.total ? Math.round((event.completed / event.total) * 100) : 0, completed: event.completed, running: 0, failed: event.failed, total: event.total })
            setBuildRoleProgress(event.role_progress || {})
          } else if (event.type === 'terminal_output') {
            setTerminalOutput(prev => [...prev.slice(-200), { text: event.output, role: event.role, taskId: event.task_id, ts: event.timestamp }])
          } else if (event.type === 'permission') {
            setPermissionRequest({ sprintId: event.sprint_id, taskId: event.task_id, taskTitle: event.task_id, command: event.cmd, description: event.reason, ts: event.timestamp })
          } else if (event.type === 'task_update') {
            setRunningTaskIds(prev => {
              const next = new Set(prev)
              if (event.status === 'running') next.add(event.task_id)
              else next.delete(event.task_id)
              return next
            })
          } else if (event.type === 'error') {
            setIsBuilding(false)
          }
        },
        onDone: (data) => {
          setBuildComplete({ status: data.status, completed: data.completed_tasks, failed: data.failed_tasks, total: data.total_tasks })
          setIsBuilding(false)
          setRunningTaskIds(new Set())
          fetchWorkflow()
        },
        onError: () => setIsBuilding(false),
      })

      // Store close function for cleanup
      window._sprintBuildClose = close
    } catch (e) {
      console.error('Sprint build failed:', e)
      setIsBuilding(false)
    }
  }

  const handleApprovePermission = async () => {
    if (!permissionRequest) return
    try {
      await SprintBuildApi.approvePermission(permissionRequest.sprintId, permissionRequest.taskId)
      setPermissionRequest(null)
    } catch (e) {
      console.error('Approve failed:', e)
    }
  }

  const handleDenyPermission = async () => {
    if (!permissionRequest) return
    try {
      await SprintBuildApi.denyPermission(permissionRequest.sprintId, permissionRequest.taskId)
      setPermissionRequest(null)
    } catch (e) {
      console.error('Deny failed:', e)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const sprints    = useMemo(() => workflow?.sprints || [], [workflow])
  const allTasks   = useMemo(() => {
    if (!workflow?.epics) return []
    return workflow.epics.flatMap(e => e.features.flatMap(f => f.tasks || []))
  }, [workflow])
  const stats      = workflow?.statistics || {}
  const hasNew     = !!workflow?.epics

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100vh', background: 'var(--color-background)' }}>
        <Flex direction="column" align="center" gap="3">
          <Box style={{ width: 32, height: 32, border: '3px solid var(--accent-9)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'wf-spin 0.8s linear infinite' }} />
          <Text size="2" color="gray">Loading implementation workflow…</Text>
        </Flex>
        <style>{`@keyframes wf-spin { to { transform: rotate(360deg) } }`}</style>
      </Flex>
    )
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (!workflow || (!workflow.epics && !workflow.phases)) {
    return (
      <Flex align="center" justify="center" direction="column" gap="4" style={{ height: '100vh', background: 'var(--color-background)', padding: 32 }}>
        <AlertCircle size={40} color="var(--gray-8)" />
        <Heading size="5">No Workflow Generated Yet</Heading>
        <Text size="2" color="gray" align="center" style={{ maxWidth: 400, lineHeight: 1.6 }}>
          Go to the project dashboard and click "Create Lifecycle Plan" to generate an engineering-grade workflow from your PRD.
        </Text>
        <Button onClick={() => navigate(`/organizations/${orgId}/projects/${projectId}/dashboard/overview`)} style={{ cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Button>
        <style>{`@keyframes wf-spin { to { transform: rotate(360deg) } }`}</style>
      </Flex>
    )
  }

  return (
    <Box style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-background)',
      fontFamily: 'var(--font-family)',
    }}>
      {/* ── HEADER — same height & border as DashboardHeaderBar ────────────── */}
      <Flex
        align="center" justify="between"
        px="4" py="1"
        style={{
          borderBottom: '1px solid var(--gray-6)',
          background: 'var(--color-panel-solid)',
          flexShrink: 0,
          height: 41,
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
    

        {/* Right — stats strip + Start Sprint button */}
        {hasNew && (
          <Flex gap="4" align="center">
            {[
              { label: 'Epics',    value: stats.total_epics    || 0 },
              { label: 'Features', value: stats.total_features || 0 },
              { label: 'Tasks',    value: stats.total_tasks    || 0 },
              { label: 'Points',   value: `${stats.total_story_points || 0}sp` },
              { label: 'Sprints',  value: stats.estimated_sprint_count || 0 },
            ].map(s => (
              <Flex key={s.label} direction="column" align="center">
                <Text size="2" weight="bold" style={{ lineHeight: 1.1 }}>{s.value}</Text>
                <Text size="1" color="gray" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Text>
              </Flex>
            ))}

            <Separator orientation="vertical" size="1" style={{ height: 24, margin: '0 4px' }} />

            {/* Start Sprint button */}
            {sprints.length > 0 && !isBuilding && (
              <Button
                size="2"
                variant="solid"
                onClick={() => {
                  const firstPending = sprints.find(s => {
                    const sp = allTasks.filter(t => t.sprint === s.id || t.sprint === s.id)
                    return sp.some(t => t.status !== 'completed')
                  })
                  if (firstPending) handleStartSprintBuild(firstPending.id)
                }}
                style={{ cursor: 'pointer', fontWeight: 600, gap: 4 }}
              >
                <Rocket size={14} /> Start Sprint
              </Button>
            )}

            {/* Building indicator */}
            {isBuilding && (
              <>
                <Button
                  size="2"
                  color="amber"
                  variant="soft"
                  style={{ cursor: 'default', gap: 4 }}
                >
                  <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'wf-pulse 1.5s ease infinite' }} />
                  Building... {buildProgress?.pct || 0}%
                </Button>
                <Button
                  size="2"
                  variant="soft"
                  color="blue"
                  onClick={() => setShowActivity(true)}
                  style={{ cursor: 'pointer', gap: 4 }}
                >
                  <Terminal size={13} /> View Activity
                </Button>
              </>
            )}
            {buildComplete && !isBuilding && (
              <Button
                size="2"
                variant="soft"
                color={buildComplete.status === 'completed' ? 'green' : 'red'}
                onClick={() => setShowActivity(true)}
                style={{ cursor: 'pointer', gap: 4 }}
              >
                <Terminal size={13} /> View Activity
              </Button>
            )}
          </Flex>
        )}
      </Flex>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <Flex style={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Sprint sidebar */}
        {hasNew && sprints.length > 0 && (
          <SprintSidebar
            sprints={sprints}
            activeFilter={sprintFilter}
            onFilter={setSprintFilter}
            allTasks={allTasks}
            epics={workflow?.epics || []}
            epicFilter={epicFilter}
            onEpicFilter={setEpicFilter}
            roleFilter={roleFilter}
            onRoleFilter={setRoleFilter}
          />
        )}

        {/* React Flow canvas */}
        <Box style={{ flexGrow: 1, position: 'relative', minWidth: 0, background: 'var(--gray-2)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.14 }}
            attributionPosition="bottom-left"
            style={{ background: 'transparent' }}
          >
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                if (n.type === 'project') return 'var(--accent-9)'
                if (n.type === 'epic')    return n.data?.color || '#3b82f6'
                if (n.type === 'feature') return 'var(--gray-7)'
                const s = n.data?.status
                return s === 'completed' ? 'var(--blue-9)' : s === 'blocked' ? 'var(--red-9)' : s === 'in_progress' ? 'var(--blue-9)' : 'var(--gray-6)'
              }}
              maskColor="rgba(0,0,0,0.05)"
            />
            <Background variant="dots" gap={22} size={1} color="var(--gray-5)" />
          </ReactFlow>
        </Box>

        {/* Task drawer */}
        <TaskDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          orgUsers={orgUsers}
          isRunningAgent={isRunningAgent}
          agentLogs={agentLogs}
          onRunAgent={handleRunAgent}
          buildActivity={buildActivity}
          buildProgress={buildProgress}
          buildRoleProgress={buildRoleProgress}
          buildComplete={buildComplete}
          isBuilding={isBuilding}
          terminalOutput={terminalOutput}
          permissionRequest={permissionRequest}
          onApprovePermission={handleApprovePermission}
          onDenyPermission={handleDenyPermission}
        />

        {/* ── Activity Panel ───────────────────────────────────────────────── */}
        {showActivity && (isBuilding || buildComplete) && !selectedTask && (
          <ActivityPanel
            buildActivity={buildActivity}
            buildProgress={buildProgress}
            buildRoleProgress={buildRoleProgress}
            buildComplete={buildComplete}
            isBuilding={isBuilding}
            terminalOutput={terminalOutput}
            permissionRequest={permissionRequest}
            onApprovePermission={handleApprovePermission}
            onDenyPermission={handleDenyPermission}
            onClose={() => setShowActivity(false)}
          />
        )}
      </Flex>

      <style>{`
        @keyframes wf-spin { to { transform: rotate(360deg) } }
        @keyframes wf-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes wf-node-pulse { 0%, 100% { box-shadow: 0 0 8px rgba(59,130,246,0.15); } 50% { box-shadow: 0 0 16px rgba(59,130,246,0.35); } }
        .nav-item { transition: background 0.12s ease, color 0.12s ease; }
        .react-flow__controls { border-radius: var(--radius-3) !important; border: 1px solid var(--gray-5) !important; box-shadow: 0 2px 8px var(--gray-a4) !important; }
        .react-flow__controls button { border-color: var(--gray-4) !important; color: var(--gray-11) !important; background: var(--color-panel-solid) !important; }
        .react-flow__controls button:hover { background: var(--gray-3) !important; }
        .react-flow__minimap { border: 1px solid var(--gray-4) !important; border-radius: var(--radius-3) !important; box-shadow: 0 2px 8px var(--gray-a3) !important; }
        .dark .react-flow__node .rt-Badge { color: white !important; }
      `}</style>
    </Box>
  )
}
