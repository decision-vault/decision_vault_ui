import { Avatar, Card, Flex, IconButton } from '@radix-ui/themes'

export function ProjectRail() {
  return (
    <Card className="panel rail-col" size="1">
      <Flex direction="column" align="center" gap="3" height="100%" pt="2">
        <IconButton size="4" radius="large" variant="solid" className="rail-main-btn">
          C
        </IconButton>
        <IconButton size="4" radius="large" variant="surface" className="rail-btn">
          ϟ
        </IconButton>
        <IconButton size="4" radius="large" variant="surface" className="rail-btn">
          ◖
        </IconButton>
        <IconButton size="4" radius="large" variant="soft" color="gray" className="rail-add-btn">
          +
        </IconButton>
        <div className="spacer" />
        <Avatar fallback="KV" radius="full" size="3" className="rail-avatar" />
      </Flex>
    </Card>
  )
}
