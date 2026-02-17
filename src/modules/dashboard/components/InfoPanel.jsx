import { Avatar, Badge, Card, Flex, Heading, Tabs, Text } from '@radix-ui/themes'
import { members } from '../data'

const memberTagTone = {
  Design: 'member-tag-design',
  Management: 'member-tag-management',
  Development: 'member-tag-development',
}

export function InfoPanel() {
  return (
    <Card className="panel info-col" size="1">
      <Tabs.Root defaultValue="info">
        <Tabs.List size="2" className="info-tabs">
          <Tabs.Trigger value="info">Info</Tabs.Trigger>
          <Tabs.Trigger value="pins">Pins</Tabs.Trigger>
          <Tabs.Trigger value="files">Files</Tabs.Trigger>
          <Tabs.Trigger value="links">Links</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="info" className="info-content">
          <section className="info-block">
            <Heading className="info-heading">Main info</Heading>
            <div className="main-info-list">
              <div className="main-info-row">
                <Flex align="center" gap="3">
                  <span className="row-icon">◌</span>
                  <Text className="main-label">Creator</Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Avatar fallback="AM" size="1" radius="full" />
                  <Text className="main-value">Andrew M.</Text>
                </Flex>
              </div>
              <div className="main-info-row">
                <Flex align="center" gap="3">
                  <span className="row-icon">⌗</span>
                  <Text className="main-label">Date of creation</Text>
                </Flex>
                <Text className="main-value">28 May</Text>
              </div>
              <div className="main-info-row">
                <Flex align="center" gap="3">
                  <span className="row-icon">✶</span>
                  <Text className="main-label">Status</Text>
                </Flex>
                <Badge color="green" variant="soft" className="status-chip">
                  • Active
                </Badge>
              </div>
              <div className="main-info-row">
                <Flex align="center" gap="3">
                  <span className="row-icon">⌁</span>
                  <Text className="main-label">Tags</Text>
                </Flex>
                <Text className="main-value">13 ›</Text>
              </div>
              <div className="main-info-row">
                <Flex align="center" gap="3">
                  <span className="row-icon">◔</span>
                  <Text className="main-label">Tasks</Text>
                </Flex>
                <Text className="main-value">4 ›</Text>
              </div>
            </div>
          </section>

          <section className="info-block">
            <Heading className="info-heading">Linked threads</Heading>
            <div className="linked-rows">
              <div className="linked-row">
                <Flex align="center" gap="3">
                  <span className="side-icon-chip">#</span>
                  <Text className="linked-label">Front-end</Text>
                </Flex>
                <Badge variant="surface" className="side-count">
                  4
                </Badge>
              </div>
              <div className="linked-row">
                <Flex align="center" gap="3">
                  <span className="side-icon-chip">#</span>
                  <Text className="linked-label">UI-kit design standards</Text>
                </Flex>
              </div>
            </div>
          </section>

          <section className="info-block">
            <Heading className="info-heading">Thread activity</Heading>
            <div className="activity-grid">
              {Array.from({ length: 24 }).map((_, index) => (
                <span key={index} className={index % 3 === 0 ? 'activity-dot active' : 'activity-dot'} />
              ))}
            </div>
          </section>

          <section className="info-block">
            <Flex align="center" justify="between" className="members-head">
              <Flex align="center" gap="2">
                <Heading className="info-heading">Members</Heading>
                <Text className="members-count">9</Text>
              </Flex>
              <Flex gap="3" className="members-tools">
                <Text>+</Text>
                <Text>⚗</Text>
                <Text>⇅</Text>
              </Flex>
            </Flex>

            <Flex direction="column" gap="3" mt="2">
              {members.map((member) => (
                <Flex align="center" justify="between" key={member.name} className="member-item">
                  <Flex align="center" gap="3">
                    <Avatar fallback={member.name.slice(0, 2).toUpperCase()} radius="full" size="4" />
                    <Flex direction="column" gap="1">
                      <Text className="member-name">{member.name}</Text>
                      <Text className="member-role">{member.role}</Text>
                    </Flex>
                  </Flex>
                  <Badge variant="soft" className={`member-tag ${memberTagTone[member.tag] ?? ''}`}>
                    {member.tag}
                  </Badge>
                </Flex>
              ))}
            </Flex>

            <Text className="offline-text">Offline</Text>
          </section>
        </Tabs.Content>

        <Tabs.Content value="pins" className="info-content">
          <Text color="gray">No pinned items yet.</Text>
        </Tabs.Content>
        <Tabs.Content value="files" className="info-content">
          <Text color="gray">No files attached.</Text>
        </Tabs.Content>
        <Tabs.Content value="links" className="info-content">
          <Text color="gray">No links added.</Text>
        </Tabs.Content>
      </Tabs.Root>
    </Card>
  )
}
