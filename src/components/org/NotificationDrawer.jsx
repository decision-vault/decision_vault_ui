import { Box, Flex, Text, Button, Tabs } from "@radix-ui/themes";
import { ChevronDown, X } from "lucide-react";

// Custom Icon to match the image's empty state icon
const EmptyFilterIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="14" y2="12" />
    <line x1="4" y1="17" x2="10" y2="17" />
    <circle cx="17" cy="17" r="3" />
    <line x1="19.5" y1="19.5" x2="22" y2="22" />
  </svg>
);

export default function NotificationDrawer({ onClose }) {
  // Array to map through contents for all tabs easily
  const tabValues = ["all", "security", "performance", "messages"];

  return (
    <Tabs.Root
      defaultValue="all"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "white",
        fontFamily: "var(--default-font-family, inherit)",
      }}
    >
      {/* Header containing Tabs List and Filters */}
      <Flex
        align="center"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-5)",
          paddingRight: "16px",
          paddingLeft: "8px",
        }}
      >
        <Tabs.List
          size="2"
          style={{
            boxShadow: "none", // Removes the default Radix line to use the Flex border instead
          }}
        >
          <Tabs.Trigger value="all">All</Tabs.Trigger>
          <Tabs.Trigger value="security">Security</Tabs.Trigger>
          <Tabs.Trigger value="performance">Performance</Tabs.Trigger>
          <Tabs.Trigger value="messages">Messages</Tabs.Trigger>
        </Tabs.List>

        {/* Filters & Close */}
        <Flex gap="3" align="center">
          <Button
            variant="ghost"
            size="1"
            style={{
              border: "1px dashed var(--gray-7)",
              backgroundColor: "transparent",
              color: "var(--gray-12)",
              fontWeight: 400,
              padding: "4px 8px",
              height: "auto",
              cursor: "pointer",
            }}
          >
            Status <ChevronDown size={14} color="var(--gray-11)" />
          </Button>

          <Button
            variant="outline"
            color="gray"
            size="1"
            style={{
              backgroundColor: "transparent",
              color: "var(--gray-12)",
              fontWeight: 400,
              padding: "4px 8px",
              height: "auto",
              cursor: "pointer",
            }}
          >
            Severity: 2 <ChevronDown size={14} color="var(--gray-11)" />
          </Button>

          <Box ml="2" style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="ghost"
              color="gray"
              onClick={onClose}
              style={{ padding: 0, margin: 0, height: "auto", cursor: "pointer" }}
            >
              <X size={16} color="var(--gray-11)" strokeWidth={1.5} />
            </Button>
          </Box>
        </Flex>
      </Flex>

      {/* Body / Empty State (Applied to all tabs for this demo) */}
      <Box style={{ flex: 1, overflow: "hidden" }}>
        {tabValues.map((tab) => (
          <Tabs.Content
            key={tab}
            value={tab}
            style={{ height: "100%", margin: 0 }}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              style={{ height: "100%", padding: "32px" }}
            >
              <Box style={{ color: "var(--gray-11)", marginBottom: "16px" }}>
                <EmptyFilterIcon />
              </Box>

              <Text size="3" weight="medium" style={{ color: "var(--gray-12)" }}>
                No items found
              </Text>

              <Text
                size="2"
                mt="1"
                style={{ color: "var(--gray-11)", textAlign: "center" }}
              >
                No advisor items match your current filters
              </Text>

              <Button
                variant="outline"
                color="gray"
                mt="4"
                style={{
                  cursor: "pointer",
                  fontWeight: 400,
                  color: "var(--gray-12)",
                }}
              >
                Clear filters
              </Button>
            </Flex>
          </Tabs.Content>
        ))}
      </Box>
    </Tabs.Root>
  );
}