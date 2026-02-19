import {
  Box,
  Flex,
  Text,
  Card,
  Heading,
  Table,
  ScrollArea,
} from '@radix-ui/themes'

const KPI_CARDS = [
  { label: 'Daily active users', value: '3,000', sub: 'Target DAU' },
  { label: 'Total tasks', value: '27', sub: 'Across 5 roles' },
  { label: 'Est. effort', value: '33 d', sub: 'Total' },
  { label: 'Documents', value: '10', sub: 'PRD to threat model' },
]

const CHART_BARS = [
  { label: 'Product', value: 2, max: 12.5 },
  { label: 'Backend', value: 12.5, max: 12.5 },
  { label: 'Frontend', value: 9, max: 12.5 },
  { label: 'DevOps', value: 6, max: 12.5 },
  { label: 'QA', value: 3.5, max: 12.5 },
]

const METRICS_ROWS = [
  { name: 'API latency (p95)', value: '< 300 ms', status: 'Target' },
  { name: 'Uptime', value: '≥ 99.5%', status: 'Target' },
  { name: 'Concurrent users', value: '300', status: 'Peak' },
  { name: 'RPS (peak)', value: '60', status: 'Target' },
  { name: 'Auth failure rate', value: '< 1%', status: 'Target' },
]

export function DashboardPage() {
  return (
    <ScrollArea type="auto" scrollbars="vertical" style={{ height: '100%' }}>
      <Box p="4" style={{ maxWidth: 960 }}>
        <Heading size="3" mb="3">
          KPIs
        </Heading>
        <Flex gap="3" wrap="wrap" mb="5">
          {KPI_CARDS.map((kpi) => (
            <Card key={kpi.label} size="2" style={{ minWidth: 160, flex: '1 1 160px' }}>
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">
                  {kpi.label}
                </Text>
                <Text size="6" weight="bold">
                  {kpi.value}
                </Text>
                <Text size="1" color="gray">
                  {kpi.sub}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>

        <Heading size="3" mb="3">
          Effort by role (days)
        </Heading>
        <Card size="2" mb="5" style={{ overflow: 'hidden' }}>
          <Box p="4">
            <Flex direction="column" gap="3">
              {CHART_BARS.map((bar) => (
                <Flex key={bar.label} align="center" gap="3">
                  <Text size="2" style={{ minWidth: 72 }}>
                    {bar.label}
                  </Text>
                  <Box
                    style={{
                      flex: 1,
                      height: 24,
                      background: 'var(--gray-4)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        width: `${(bar.value / bar.max) * 100}%`,
                        height: '100%',
                        background: 'var(--accent-9)',
                        borderRadius: 4,
                        minWidth: 4,
                      }}
                    />
                  </Box>
                  <Text size="2" color="gray">
                    {bar.value} d
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Card>

        <Heading size="3" mb="3">
          Metrics
        </Heading>
        <Card size="2">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Metric</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {METRICS_ROWS.map((row) => (
                <Table.Row key={row.name}>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.value}</Table.Cell>
                  <Table.Cell>
                    <Text size="2" color="gray">
                      {row.status}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      </Box>
    </ScrollArea>
  )
}
