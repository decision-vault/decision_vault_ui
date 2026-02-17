import {
  Avatar,
  Badge,
  Button,
  Card,
  Flex,
  ScrollArea,
  Separator,
  Text,
  TextArea,
} from '@radix-ui/themes'

function ThreadMessage({ name, time, text, mention }) {
  return (
    <div className="thread-message">
      <Flex align="start" gap="3">
        <Avatar fallback={name.slice(0, 2).toUpperCase()} radius="full" size="3" />
        <Flex direction="column" gap="2" className="thread-message-body">
          <Flex align="center" gap="2">
            <Text weight="bold" className="msg-author">
              {name}
            </Text>
            <Text color="gray" className="msg-time">
              {time}
            </Text>
          </Flex>
          <Text className="msg-copy">{text}</Text>
          {mention ? <Text className="mention">{mention}</Text> : null}
        </Flex>
      </Flex>
    </div>
  )
}

export function ThreadCenter() {
  return (
    <Card className="panel thread-col" size="1">
      <Flex direction="column" height="100%">
        <Flex align="center" justify="between" className="thread-topbar" px="4" py="3">
          <Flex align="center" gap="2">
            <Badge variant="surface">#</Badge>
            <Text weight="medium" className="thread-title">
              Website / v3.0 / UI-kit design
            </Text>
          </Flex>
          <Flex gap="4" align="center" color="gray">
            <Text size="4">...</Text>
            <Text size="4">✧</Text>
            <Text size="4">ⓘ</Text>
          </Flex>
        </Flex>

        <Separator size="4" />

        <ScrollArea type="always" scrollbars="vertical" className="scroll-fill">
          <div className="chat-scroll-body">
            <div className="thread-intro">
              <Text className="msg-copy">
                Hey team, I wanted to discuss the custom UI-kit we&apos;re developing for the site
                redesign. We need to finalize some components and make key design decisions to ensure
                consistency across the board. Let&apos;s make sure we cover colors, typography,
                buttons, and any other essential UI elements.
              </Text>
              <Text className="mention">@UX/UI @Sophia</Text>
              <Flex gap="2" mt="3" align="center">
                <Badge variant="surface" className="reaction-pill">
                  ☝ 2
                </Badge>
                <Badge variant="surface" className="reaction-pill">
                  ◔+
                </Badge>
              </Flex>
            </div>

            <ThreadMessage
              name="Diana T."
              time="2d ago"
              text="I have already prepared all styles and components according to our standards during the design phase, so the UI kit is 90% complete. All that remains is to add some states to the interactive elements and prepare the Lottie files for animations."
              mention="@Emily D., please take a look and let me know if you have any questions."
            />

            <Card size="2" className="link-preview">
              <Flex align="center" justify="between">
                <Flex align="center" gap="3">
                  <div className="figma-mark" />
                  <Flex direction="column" gap="1">
                    <Text weight="medium" className="link-title">
                      Conceptzilla website v.3.0
                    </Text>
                    <Text color="gray" className="link-subtitle">
                      www.figma.com
                    </Text>
                  </Flex>
                </Flex>
                <Button variant="surface" className="quick-view-btn">
                  Quick view
                </Button>
              </Flex>
            </Card>

            <Flex gap="2" mb="4">
              <Badge variant="surface" className="reaction-pill">
                ❤
              </Badge>
              <Badge variant="surface" className="reaction-pill">
                ◔+
              </Badge>
            </Flex>

            <ThreadMessage
              name="Daniel A."
              time="3h ago"
              text="Okay, keep me updated. @Diana T. I also wanted to remind you to keep the layers organized."
            />

            <Card size="3" className="composer-box">
              <Flex direction="column" gap="3" className="composer-wrap">
                <div className="mention-popup">
                  <Text color="gray" className="mention-popup-title">
                    Members
                  </Text>
                  <Card size="1" className="mention-row mention-row-active" variant="ghost">
                    <Flex align="center" gap="2">
                      <Avatar fallback="DT" size="1" radius="full" />
                      <Text>Diana Taylor</Text>
                    </Flex>
                  </Card>
                  <Card size="1" className="mention-row" variant="ghost">
                    <Flex align="center" gap="2">
                      <Avatar fallback="DA" size="1" radius="full" />
                      <Text>Daniel Anderson</Text>
                    </Flex>
                  </Card>
                </div>

                <TextArea
                  size="3"
                  className="composer-input"
                  defaultValue="Thanks team. Finalize the states and we'll start development. We are breaking records 💪💪 @D"
                />

                <Flex justify="between" align="center">
                  <Flex gap="4" className="composer-tools">
                    <Text>✧</Text>
                    <Text>@</Text>
                    <Text>⚡</Text>
                    <Text>☺</Text>
                    <Text>⊂</Text>
                    <Text>◍</Text>
                  </Flex>
                  <Flex gap="2">
                    <Button variant="soft" color="gray" className="composer-discard">
                      Discard
                    </Button>
                    <Button color="gray" highContrast className="composer-send">
                      Send
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          </div>
        </ScrollArea>
      </Flex>
    </Card>
  )
}
