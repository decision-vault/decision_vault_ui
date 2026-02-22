import { Box, Flex, Text, IconButton, Avatar } from '@radix-ui/themes'
import { BarChartIcon, PieChartIcon, PlusIcon } from '@radix-ui/react-icons'

/**
 * Left project panel for the dashboard layout.
 * Icons, add button, and user avatar.
 */
export function DashboardProjectPanel() {
  return (
    <Flex
      direction="column"
      align="center"
      gap="2"
      p="2"
      style={{
        width: 56,
        flexShrink: 0,
        borderRight: '1px solid var(--gray-6)',
        background: 'var(--color-panel-translucent)',
        borderRadius: '0 12px 12px 0',
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <IconButton
        variant="soft"
        size="3"
        radius="default"
        aria-label="Projects"
        title="Projects"
        style={{ background: 'var(--gray-12)', color: 'var(--gray-1)' }}
      >
        <Text size="2" weight="bold">D</Text>
      </IconButton>
      {/* <IconButton variant="ghost" size="3" radius="default" aria-label="Analytics" title="Analytics">
        <BarChartIcon width="20" height="20" />
      </IconButton>
      <IconButton variant="ghost" size="3" radius="default" aria-label="Insights" title="Insights">
        <PieChartIcon width="20" height="20" />
      </IconButton> */}
      <IconButton variant="soft" size="3" radius="default" aria-label="Add project" title="Add project" style={{ marginTop: 4 }}>
        <PlusIcon width="20" height="20" />
      </IconButton>
      <Box style={{ flex: 1, minHeight: 16 }} />
      <Avatar size="2" radius="full" fallback="U" />
    </Flex>
  )
}
