import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Card, Flex, Heading, Text, Button, Grid, Badge, Tabs, Separator, Progress, Select } from '@radix-ui/themes'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { GitBranch, Terminal, Settings, Sparkles } from 'lucide-react'
import { WorkflowApi } from '../../services/workflowApi'
import { listOrgUsers } from '../../services/orgUsersApi'

export default function AgentWorkflowBuilderPage() {
  const { orgId, projectId } = useParams()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [activeAgentTab, setActiveAgentTab] = useState('Designer Agent')
  const [orgUsers, setOrgUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch organization users on component mount
  useEffect(() => {
    if (!orgId) return
    listOrgUsers(orgId)
      .then((users) => {
        setOrgUsers(users || [])
      })
      .catch((err) => {
        console.error("Failed to load organization users:", err)
      })
  }, [orgId])

  const handleAssignAgent = (role, assignee) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.data && node.data.id === selectedFeature.id) {
          const updatedAgents = node.data.agents.map((agent) => {
            if (agent.role === role) {
              return { ...agent, assignee }
            }
            return agent
          })
          const updatedData = { ...node.data, agents: updatedAgents }
          
          // Update selectedFeature immediately so the drawer reflects changes
          setSelectedFeature(updatedData)
          
          return {
            ...node,
            data: updatedData
          }
        }
        return node
      })
    )
  }

  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)
    WorkflowApi.getWorkflow(projectId)
      .then((data) => {
        if (data) {
          setNodes(data.nodes || [])
          setEdges(data.edges || [])
        }
      })
      .catch((err) => {
        console.error("Failed to load workflow:", err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [projectId, setNodes, setEdges])

  const handleSyncToDb = async () => {
    if (!projectId) return
    try {
      setIsSaving(true)
      await WorkflowApi.updateWorkflow(projectId, {
        nodes,
        edges
      })
      alert("Workflow synchronized to database successfully!")
    } catch (err) {
      console.error("Failed to sync workflow:", err)
      alert("Failed to sync workflow to database.")
    } finally {
      setIsSaving(false)
    }
  }

  const onNodeClick = useCallback((event, node) => {
    if (node.data && node.data.agents) {
      setSelectedFeature(node.data)
      setActiveAgentTab(node.data.agents[0].role)
    }
  }, [])

  const statusBadgeColor = (status) => {
    if (status === 'completed') return 'green'
    if (status === 'processing') return 'orange'
    return 'gray'
  }

  const activeAgentData = useMemo(() => {
    if (!selectedFeature) return null
    return selectedFeature.agents.find(a => a.role === activeAgentTab)
  }, [selectedFeature, activeAgentTab])

  if (isLoading) {
    return (
      <Flex p="8" align="center" justify="center" style={{ height: '100vh', background: 'var(--gray-2)' }}>
        <Text color="gray">Loading workflow lifecycle data...</Text>
      </Flex>
    )
  }

  return (
    <Box style={{ height: '100vh', width: '100%', background: 'var(--gray-2)', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>

      {/* PAGE HEADER STRIP */}
      <Flex
        px="4"
        align="center"
        justify="between"
        style={{ height: '41px', flexShrink: 0, borderBottom: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)', zIndex: 20 }}
      >
        <Flex align="center" gap="2">
          <GitBranch size={14} style={{ color: 'var(--gray-10)' }} />
          <Text size="3" weight="medium">Workflow Builder</Text>
          <Badge size="1" color="amber" variant="soft">Beta</Badge>
        </Flex>
      </Flex>

      {/* TOP CONTROLS CONSOLE HEADER */}
      <Flex p="4" justify="between" align="center" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--gray-4)', zIndex: 10 }}>
        <Box>
          <Flex align="center" gap="2">
            <Heading size="4" weight="bold" style={{ letterSpacing: '-0.4px', color: 'var(--gray-12)' }}>Agentic Lifecycle Builder</Heading>
            <Badge size="1" color="blue" variant="surface" style={{ borderRadius: '6px' }}>Live View</Badge>
          </Flex>
          <Text size="1" color="gray">Click individual Feature Module nodes on the screen grid canvas below to monitor underlying sub-agent tasks execution loops.</Text>
        </Box>
        <Flex gap="3" align="center">
          <Button 
            color="blue" 
            variant="classic" 
            onClick={handleSyncToDb} 
            disabled={isSaving}
            style={{ cursor: 'pointer', borderRadius: '8px', fontWeight: '600', padding: '0 16px', gap: '6px' }}
          >
            <Sparkles size={14} /> {isSaving ? "Syncing..." : "Sync Execution to DB"}
          </Button>
        </Flex>
      </Flex>

      {/* TWO-PANEL INTERACTIVE CANVAS WORKSPACE */}
      <Grid columns={selectedFeature ? '1fr 480px' : '1fr'} style={{ flexGrow: 1, overflow: 'hidden' }}>
        
        {/* EXPANSIVE FULL-SCREEN REACT FLOW WORKSPACE */}
        <Box style={{ height: '100%', width: '100%', position: 'relative', background: 'var(--gray-1)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls style={{ boxShadow: 'var(--shadow-2)', border: '1px solid var(--gray-4)' }} />
            <MiniMap style={{ background: 'var(--color-surface)', borderRadius: '10px', border: '1px solid var(--gray-4)' }} nodeColor={() => 'var(--blue-3)'} />
            <Background variant="dots" gap={20} size={1} color="var(--gray-4)" />
          </ReactFlow>
        </Box>

        {/*  REFACTORED PREMIUM DRAWER PANEL SHEET */}
        {selectedFeature && (
          <Box style={{ background: 'var(--color-surface)', borderLeft: '1px solid var(--gray-4)', overflowY: 'auto', zIndex: 5, boxShadow: '-4px 0 24px rgba(0,0,0,0.02)' }}>
            <Flex direction="column" gap="4" p="5">
              
              {/* Feature Module Context Meta */}
              <Box>
                <Flex justify="between" align="start">
                  <Box style={{ maxWidth: '82%' }}>
                    <Heading size="4" style={{ color: 'var(--gray-12)', letterSpacing: '-0.4px', fontWeight: '600' }}>{selectedFeature.label}</Heading>
                    <Text size="1" color="gray" style={{ display: 'block', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '9px', fontWeight: 'bold' }}>Component Node Workspace</Text>
                  </Box>
                  <Button size="1" variant="ghost" color="gray" onClick={() => setSelectedFeature(null)} style={{ cursor: 'pointer', borderRadius: '6px', padding: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </Button>
                </Flex>
                <Text size="2" color="gray" highContrast style={{ display: 'block', marginTop: '12px', lineHeight: '1.5', fontSize: '13px' }}>
                  {selectedFeature.summary}
                </Text>
              </Box>

              <Separator size="4" style={{ opacity: 0.4 }} />

              {/* Sub-Agent Workspace Tabs Controller */}
              <Box>
                <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '0.6px', fontSize: '10px' }}>
                  Select Agent Workspace
                </Text>
                
                <Tabs.Root value={activeAgentTab} onValueChange={setActiveAgentTab}>
                  <Tabs.List style={{ width: '100%', gap: '4px' }}>
                    {selectedFeature.agents.map((agent) => (
                      <Tabs.Trigger key={agent.role} value={agent.role} style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', fontWeight: '500' }}>
                        {agent.role.replace(' Agent', '')}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>

                  {/* Operational Data Content Fields Block */}
                  {activeAgentData && (
                    <Box mt="4">
                      <Flex direction="column" gap="4">
                        
                        {/* Streamlined Inline Metadata Key/Value Rows */}
                        <Grid columns="2" gap="4" style={{ background: 'var(--gray-2)', border: '1px solid var(--gray-3)', borderRadius: '10px', padding: '14px' }}>
                          <Box>
                            <Text size="1" color="gray" style={{ display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.4px', marginBottom: '4px' }}>Current Status</Text>
                            <Badge color={statusBadgeColor(activeAgentData.status)} variant="surface" size="1" style={{ textTransform: 'uppercase', borderRadius: '4px', padding: '2px 8px' }}>
                              {activeAgentData.status}
                            </Badge>
                          </Box>
                          <Box>
                            <Flex justify="between" align="center" style={{ marginBottom: '6px' }}>
                              <Text size="1" color="gray" style={{ textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.4px' }}>Task Progression</Text>
                              <Text size="1" color="gray" weight="bold" style={{ fontFamily: 'monospace', fontSize: '10px' }}>{activeAgentData.percentage}%</Text>
                            </Flex>
                            <Progress value={activeAgentData.percentage} color={activeAgentData.status === 'completed' ? 'green' : 'green'} radius="full" size="1" />
                          </Box>
                        </Grid>

                        {/* Instruction Set Frame */}
                        <Box>
                          <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.4px', fontSize: '10px' }}>
                            Instructions Checklist
                          </Text>
                          <Box style={{ background: 'transparent', padding: '0 2px' }}>
                            <Text size="2" color="gray" highContrast style={{ lineHeight: '1.5', fontSize: '13px' }}>
                              • {activeAgentData.task}
                            </Text>
                          </Box>
                        </Box>

                        {/* Assignee Selection Block */}
                        <Box>
                          <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.4px', fontSize: '10px' }}>
                            Assignee
                          </Text>
                          <Select.Root
                            value={activeAgentData.assignee || "unassigned"}
                            onValueChange={(val) => handleAssignAgent(activeAgentData.role, val === "unassigned" ? "" : val)}
                          >
                            <Select.Trigger style={{ width: '100%', borderRadius: '8px' }} placeholder="Select Assignee..." />
                            <Select.Content>
                              <Select.Item value="unassigned">Unassigned</Select.Item>
                              {orgUsers.map((user) => (
                                <Select.Item key={user.id} value={user.id}>
                                  {user.email} ({user.role})
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        </Box>

                        {/* Terminal Activity Logger Frame */}
                        <Box>
                          <Flex justify="between" align="center" mb="2">
                            <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '10px' }}>
                              Diagnostic Activity Logs Trace
                            </Text>
                            <Flex align="center" gap="1" style={{ color: 'var(--gray-8)', fontSize: '10px', fontWeight: '500' }}>
                              <Settings size={13} style={{ animation: activeAgentData.status === 'processing' ? 'spin 5s linear infinite' : 'none', color: activeAgentData.status === 'processing' ? 'var(--orange-9)' : 'inherit' }} /> 
                              <Text size="1" color={activeAgentData.status === 'processing' ? 'orange' : 'gray'}>
                                {activeAgentData.status === 'processing' ? 'Streaming...' : 'Idle'}
                              </Text>
                            </Flex>
                          </Flex>
                          
                          {/* Polished Glassmorphic Low-Contrast Dark Console Shell */}
                          <Box 
                            p="3" 
                            style={{ 
                              background: 'var(--gray-2)', 
                              borderRadius: '8px', 
                              fontFamily: 'monospace', 
                              fontSize: '11px', 
                              maxHeight: '210px',
                              overflowY: 'auto',
                              border: '1px solid var(--gray-4)'
                            }}
                          >
                            <Flex direction="column" gap="2">
                              {activeAgentData.logs.map((log, index) => (
                                <Flex key={index} gap="2" align="start">
                                  <Box style={{ color: 'var(--gray-8)', flexShrink: 0, marginTop: '2px' }}><Terminal size={12} /></Box>
                                  <Text style={{ color: 'var(--gray-11)', lineHeight: '1.4', fontSize: '11px' }}>{log}</Text>
                                </Flex>
                              ))}
                              {activeAgentData.status === 'processing' && (
                                <Text style={{ color: 'var(--amber-11)', paddingLeft: '14px', position: 'relative', fontSize: '11px' }}>
                                  <span style={{ position: 'absolute', left: 0, top: '5px', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--amber-9)' }} />
                                  Awaiting execution sub-routine cycle...
                                </Text>
                              )}
                            </Flex>
                          </Box>
                        </Box>

                      </Flex>
                    </Box>
                  )}
                </Tabs.Root>
              </Box>

            </Flex>
          </Box>
        )}

      </Grid>
    </Box>
  )
}