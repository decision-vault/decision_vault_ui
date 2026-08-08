import {
  Box,
  Flex,
  Badge,
  Text,
  Button,
} from "@radix-ui/themes";

import {
  BookOpen,
  Wrench,
  Activity,
  Mail,
  ChevronRight,
  X,
} from "lucide-react";

// Custom Discord SVG Icon
const DiscordIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 127.14 96.36"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-19.32-72.1ZM42.61,65.3c-5.31,0-9.68-4.88-9.68-10.86s4.3-10.86,9.68-10.86c5.41,0,9.76,4.92,9.68,10.86,0,5.98-4.3,10.86-9.68,10.86Zm41.87,0c-5.31,0-9.68-4.88-9.68-10.86s4.3-10.86,9.68-10.86c5.41,0,9.76,4.92,9.68,10.86,0,5.98-4.27,10.86-9.68,10.86Z" />
  </svg>
);

function HelpItem({ icon, title, description }) {
  return (
    <Flex
      align="center"
      justify="between"
      px="4"
      py="4"
      style={{
        borderBottom: "1px solid var(--gray-5)",
        cursor: "pointer",
        backgroundColor: "white",
      }}
    >
      <Flex gap="4" align="start">
        <Box
          style={{
            color: "var(--gray-11)",
            display: "flex",
            alignItems: "center",
            marginTop: "2px",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Text as="div" size="3" style={{ color: "var(--gray-12)" }}>
            {title}
          </Text>

          <Text
            as="div"
            size="2"
            style={{
              color: "var(--gray-11)",
              marginTop: "4px",
            }}
          >
            {description}
          </Text>
        </Box>
      </Flex>

      <ChevronRight size={18} color="var(--gray-8)" />
    </Flex>
  );
}

export default function HelpDrawer({ onClose }) {
  return (
    <Box
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "white",
        fontFamily: "var(--default-font-family, inherit)",
      }}
    >
      {/* Header */}
      <Flex
        justify="between"
        align="center"
        px="4"
        py="3"
        style={{
          borderBottom: "1px solid var(--gray-5)",
        }}
      >
        <Text size="3" weight="medium" style={{ color: "var(--gray-12)" }}>
          Help &amp; Support
        </Text>

        <Flex align="center" gap="3">
          <Badge
            variant="surface"
            radius="full"
            style={{
              padding: "4px 10px",
              fontWeight: "normal",
              color: "var(--gray-12)",
              backgroundColor: "transparent",
              border: "1px solid var(--gray-5)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--blue-9)",
              }}
            />
            All systems operational
          </Badge>

          <Button
            variant="ghost"
            color="gray"
            onClick={onClose}
            style={{ padding: 0, margin: 0, height: "auto", cursor: "pointer" }}
          >
            <X size={18} color="var(--gray-11)" strokeWidth={1.5} />
          </Button>
        </Flex>
      </Flex>

      {/* Menu */}
      <HelpItem
        icon={<BookOpen size={20} strokeWidth={1.5} />}
        title="Docs"
        description="Browse guides, references, and product documentation."
      />

      <HelpItem
        icon={<Wrench size={20} strokeWidth={1.5} />}
        title="Troubleshooting"
        description="Find fixes for common platform issues and errors."
      />

      <HelpItem
        icon={<Activity size={20} strokeWidth={1.5} />}
        title="Supabase status"
        description="Check incidents, maintenance, and uptime updates."
      />

      <HelpItem
        icon={<Mail size={20} strokeWidth={1.5} />}
        title="Contact support"
        description="Reach support for account and platform issues."
      />

      {/* Community */}
      <Box px="4" py="5">
        <Text as="div" size="3" weight="medium" style={{ color: "var(--gray-12)" }}>
          Community support
        </Text>

        <Text
          as="p"
          size="2"
          mt="1"
          style={{
            color: "var(--gray-11)",
            lineHeight: 1.5,
            marginBottom: "16px",
          }}
        >
          Our Discord community can help with code-related
          issues. Many questions are answered in minutes.
        </Text>

        <Box
          style={{
            height: "140px",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
            background:
              "radial-gradient(120% 140% at 85% 100%, #7B84F5 0%, #5865F2 35%, #4650E0 65%, #3B3FC9 100%)",
          }}
        >
          {/* Soft abstract shapes to echo a community/crowd illustration
              without reproducing any specific copyrighted artwork */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 140"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0 }}
          >
            <circle cx="330" cy="150" r="90" fill="rgba(255,255,255,0.08)" />
            <circle cx="270" cy="160" r="60" fill="rgba(255,255,255,0.06)" />
            <circle cx="380" cy="40" r="30" fill="rgba(255,255,255,0.05)" />
          </svg>

          <Box
            style={{
              position: "relative",
              height: "100%",
              display: "flex",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <Button
              style={{
                backgroundColor: "#000000",
                color: "#FFFFFF",
                fontWeight: 500,
                borderRadius: "999px",
                padding: "8px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                border: "none",
                fontSize: "14px",
              }}
            >
              <Box style={{ color: "#5865F2", display: "flex" }}>
                <DiscordIcon />
              </Box>
              Join us on Discord
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
