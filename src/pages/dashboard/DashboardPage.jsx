import { useCallback, useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  ScrollArea,
  Text,
  Tooltip,
  Select,
} from '@radix-ui/themes'
import {
  RefreshCw,
  Copy,
  Box as BoxIcon,
  Sliders,
  Link2,
  Code2,
  Zap,
  Key,
  BarChart3,
  HelpCircle,
  Pin
} from 'lucide-react'
import { getOwnerDashboardSummary } from '../../services/dashboardApi'
import { useParams, useNavigate } from 'react-router-dom'
import { DocsManagementService } from '../../services/docManager'
import { apiRequest } from '../../services/apiClient'

function statusColor(status) {
  if (!status) return 'gray'
  const value = String(status).toLowerCase()
  if (value.includes('completed') || value.includes('active') || value.includes('ready') || value.includes('healthy')) return 'green'
  if (value.includes('running') || value.includes('queued') || value.includes('draft')) return 'blue'
  if (value.includes('paused') || value.includes('pending')) return 'amber'
  if (value.includes('failed') || value.includes('error') || value.includes('stopped')) return 'red'
  return 'gray'
}

function DetailMiniTile({ icon, title, value, badge }) {
  return (
    <Flex gap="3" p="3" align="center" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--color-panel-solid)' }}>
      <Flex align="center" justify="center" style={{ width: 36, height: 36, border: '1px solid var(--gray-4)', borderRadius: '6px', color: 'var(--gray-10)' }}>
        {icon}
      </Flex>
      <Box>
        <Text size="1" color="gray" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>{title}</Text>
        <Flex align="center" gap="2" mt="1">
          <Text size="2" weight="bold" style={{ color: 'var(--gray-12)' }}>{value}</Text>
          {badge && <Badge size="1" color="gray" variant="surface" radius="sm">{badge}</Badge>}
        </Flex>
      </Box>
    </Flex>
  );
}

function TelemetryCard({ title, value, warnings = 0, errors = 0 }) {
  return (
    <Card size="2" style={{ borderRadius: '8px' }}>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Text size="1" weight="bold" style={{ textTransform: 'uppercase', color: 'var(--gray-10)' }}>{title}</Text>
          <Flex gap="2">
            <Text size="1" color="gray"><span style={{ color: 'var(--amber-9)' }}>●</span> Warnings <Text weight="bold" color="gray">{warnings}</Text></Text>
            <Text size="1" color="gray"><span style={{ color: 'var(--red-9)' }}>●</span> Errors <Text weight="bold" color="gray">{errors}</Text></Text>
          </Flex>
        </Flex>
        <Box>
          <Text size="6" weight="bold">{value}</Text>
        </Box>
        <Flex direction="column" align="center" justify="center" style={{ border: '1px dashed var(--gray-4)', borderRadius: '6px', minHeight: '100px', backgroundColor: 'var(--gray-1)' }}>
          <BarChart3 size={16} style={{ color: 'var(--gray-8)', marginBottom: '4px' }} />
          <Text size="1" style={{ color: 'var(--gray-9)' }}>No data for selected period</Text>
        </Flex>
      </Flex>
    </Card>
  )
}

export function DashboardPage() {
  const { orgId, projectId } = useParams()
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  
  const [prdDoc, setPrdDoc] = useState(null)

  const loadSummary = useCallback(async () => {
    if (!orgId || !projectId) return
    setLoading(true)
    setError('')
    try {
      const data = await getOwnerDashboardSummary(orgId, projectId, days)
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard summary')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [orgId, projectId, days])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    if (!projectId) return
    DocsManagementService.getAllWorkspaces()
      .then((workspaces) => {
        for (const ws of workspaces) {
          const match = ws.documents?.find(d => d.title && d.title.toLowerCase().includes('prd'))
          if (match) {
            setPrdDoc(match)
            break
          }
        }
      })
      .catch((err) => console.error("Failed to detect active project PRD:", err))
  }, [projectId])



  return (
    <ScrollArea type="auto" scrollbars="vertical" style={{ height: '100%' }}>
     

      <Box p="8"  style={{ minHeight: '100%', backgroundColor: 'var(--gray-1)' }}>
        <Flex direction="column" gap="6" style={{ width: '100%', margin: '0 auto' }}>
          
         

          {error && (
            <Card variant="ghost" size="2" style={{ borderRadius: 8, border: '1px solid var(--red-6)' }}>
              <Text size="2" color="red">{error}</Text>
            </Card>
          )}

     {/* Main Top Section Container Matrix: Responsive from single column up to 2-column split */}
          <Grid columns={{ initial: '1', md: '1fr 1fr' }} gap="6" align="start">
            
            {/* Left Column Container: Meta Header and Details Info Grid */}
            <Flex direction="column" gap="4">
              <Box>
                <Heading size="7" weight="bold" mb="1" style={{ tracking: '-0.02em' }}>
                  {summary?.project?.name || 'test'}
                </Heading>
                <Flex align="center" gap="2" mt="2" wrap="wrap">
                  <Text size="2" color="gray" style={{ wordBreak: 'break-all' }}>
                    https://{projectId || 'pjupfhfayztmeykmfkhd'}.supabase.co
                  </Text>
                  <Button size="1" variant="soft" color="gray" radius="sm" style={{ cursor: 'pointer' }}>
                    <Copy size={12} /> Copy
                  </Button>
                </Flex>
              </Box>

              {/*  UPDATED: Responsive grid scaling dynamically across all viewports */}
              <Grid columns={{ initial: '1', sm: '2', md: '2', lg: '3' }} gap="3">
                <DetailMiniTile icon={<Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--blue-9)' }} />} title="Status" value={summary?.project?.status || 'Healthy'} />
                <DetailMiniTile icon={<BoxIcon size={16} />} title="Compute" value="Nano" badge="NANO" />
                <DetailMiniTile icon={<Link2 size={16} />} title="GitHub" value="No repository connected" />
                <DetailMiniTile icon={<Sliders size={16} />} title="Recent Branch" value="No branches" />
                <DetailMiniTile icon={<BarChart3 size={16} />} title="Last Migration" value="No migrations" />
                <DetailMiniTile icon={<BarChart3 size={16} />} title="Last Backup" value="No backups" />
              </Grid>
            </Flex>

          
          </Grid>

          <Box mt="4">
            <Heading size="3" weight="bold" mb="3">Get connected</Heading>
            <Grid columns={{ initial: '2', sm: '3', md: '6' }} gap="1" style={{ backgroundColor: 'var(--gray-4)', padding: '1px', borderRadius: '8px', overflow: 'hidden' }}>
              {[
                { icon: <BoxIcon size={16} />, title: 'Framework', sub: 'Use a client library' },
                { icon: <Sliders size={16} />, title: 'Server', sub: 'Build APIs' },
                { icon: <Link2 size={16} />, title: 'Direct', sub: 'Connection string' },
                { icon: <Code2 size={16} />, title: 'ORM', sub: 'Third-party library' },
                { icon: <Zap size={16} />, title: 'MCP', sub: 'Connect your agent' },
                { icon: <Key size={16} />, title: 'API Keys', sub: 'Manage project keys' }
              ].map((conn, idx) => (
                <Flex key={idx} direction="column" align="center" justify="center" p="4" gap="2" style={{ backgroundColor: 'var(--color-panel-solid)', textAlign: 'center', cursor: 'pointer' }}>
                  <Box style={{ color: 'var(--gray-10)' }}>{conn.icon}</Box>
                  <Text size="2" weight="bold" as="div" style={{ color: 'var(--gray-12)' }}>{conn.title}</Text>
                  <Text size="1" style={{ color: 'var(--gray-9)' }}>{conn.sub}</Text>
                </Flex>
              ))}
            </Grid>
          </Box>

          <Box mt="4">
            <Flex justify="between" align="center" mb="3">
              <Flex align="center" gap="3">
                <Heading size="3" weight="bold">0 <Text size="2" weight="normal" color="gray" style={{ marginLeft: '4px' }}>Total Requests</Text></Heading>
                <Heading size="3" weight="bold">0.0% <Text size="2" weight="normal" color="gray" style={{ marginLeft: '4px' }}>Success Rate</Text></Heading>
              </Flex>
              <Select.Root defaultValue="60m">
                <Select.Trigger size="1" radius="md" />
                <Select.Content>
                  <Select.Item value="60m">Last 60 minutes</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
              <TelemetryCard title="Postgres" value="0" />
              <TelemetryCard title="Edge Functions" value="0" />
              <TelemetryCard title="Auth" value="0" />
              <TelemetryCard title="Storage" value="0" />
              <TelemetryCard title="Realtime" value="0" />
              <TelemetryCard title="API Gateway" value="0" />
            </Grid>
          </Box>

          <Box mt="4">
            <Flex justify="between" align="center" mb="3">
              <Heading size="3" weight="bold">Advisor found no issues</Heading>
              <Button size="1" variant="outline" color="gray" radius="md"><HelpCircle size={14} /> Ask Assistant</Button>
            </Flex>
            <Flex direction="column" align="center" justify="center" p="6" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--color-panel-solid)', minHeight: '140px' }}>
              <Pin size={20} style={{ color: 'var(--gray-7)', marginBottom: '8px' }} />
              <Text size="2" style={{ color: 'var(--gray-10)' }}>No security or performance issues found</Text>
            </Flex>
          </Box>

          <Box mt="4">
            <Flex justify="between" align="center" mb="3">
              <Heading size="3" weight="bold">Reports</Heading>
              <Button size="1" variant="outline" color="gray" radius="md"><RefreshCw size={12} /> Add block</Button>
            </Flex>
            <Flex direction="column" align="center" justify="center" p="8" style={{ border: '1px dashed var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--color-panel-solid)', minHeight: '180px' }}>
              <Text size="2" weight="bold" as="div" mb="1">Build a custom report</Text>
              <Text size="1" style={{ color: 'var(--gray-10)' }} mb="4">Keep track of your most important metrics</Text>
              <Button size="1" variant="outline" color="gray" radius="md">Add your first block +</Button>
            </Flex>
          </Box>

        </Flex>
      </Box>
    </ScrollArea>
  )
}