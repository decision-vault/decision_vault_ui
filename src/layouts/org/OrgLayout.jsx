import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  Container,
  DropdownMenu,
  Flex,
  IconButton,
  Kbd,
  Text,
} from "@radix-ui/themes";

import {
  BellIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";

import { 
  User, 
  FlaskConical, 
  FileText, 
  ChevronRight,
  LogOut
} from "lucide-react";

import logo from "../../assets/logo.svg";
import { useAuth } from "../../auth/AuthContext";
import HelpDrawer from "../../components/org/HelpDrawer";
import NotificationDrawer from "../../components/org/NotificationDrawer";
import SearchDialog from "../../components/org/SearchDialog";
import FeedbackDialog from "../../components/org/FeedbackDialog";

const navTitleByPath = {
  "/organizations": "Organizations",
  "/organizations/new": "New Organization",
};

function getNavTitle(pathname) {
  return navTitleByPath[pathname] ?? "Organizations";
}

export function OrgLayout() {
  const location = useLocation();
  const title = getNavTitle(location.pathname);

  // Manage UI visibility states
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("System");

  const { sessionUser, refreshSession, signOut } = useAuth();

  // Fallbacks matching user details
  const displayName = sessionUser?.email ? sessionUser.email.split("@")[0] : "kaviyarasumaran";
  const displayEmail = sessionUser?.email || "kaviyarasumaran@gmail.com";

  const initials =
    displayEmail
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "DV";

  const toggleDrawer = (drawerName) => {
    setActiveDrawer((prev) => (prev === drawerName ? null : drawerName));
  };

  const themesList = ["System", "Dark", "Light", "Classic Dark"];

  return (
    <Box
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", 
      }}
    >
      {/* Dynamic Action Overlays */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />

      {/* ================= HEADER ================= */}
      <Flex
        align="center"
        px="5"
        style={{
          height: "60px",
          borderBottom: "1px solid var(--gray-5)",
          background: "var(--color-panel-solid)",
          flexShrink: 0,
        }}
      >
        {/* Left Branding Group */}
        <Flex align="center" gap="3">
          <Box
            asChild
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <img src={logo} alt="DecisionVault" />
          </Box>
          <ChevronRightIcon color="gray" />
          <Text size="3" weight="medium">{title}</Text>
        </Flex>

        {/* Right Interaction Dock */}
        <Flex align="center" gap="3" ml="auto">
          {/* Global Hotkey Search Input */}
          <Box style={{ width: 220 }}>
            <Flex
              align="center"
              justify="between"
              onClick={() => setSearchOpen(true)}
              style={{
                height: "32px",
                padding: "0 12px",
                borderRadius: "9999px",
                border: "1px solid var(--gray-6)",
                backgroundColor: "var(--gray-2)",
                cursor: "pointer",
                color: "var(--gray-11)",
              }}
            >
              <Flex align="center" gap="2">
                <MagnifyingGlassIcon />
                <Text size="2">Search...</Text>
              </Flex>
              <Kbd size="1">⌘K</Kbd>
            </Flex>
          </Box>

          {/* Context Feedback Dropdown Control */}
          <IconButton
            variant={feedbackOpen ? "soft" : "surface"}
            color={feedbackOpen ? "green" : undefined}
            radius="full"
            size="2"
            onClick={() => setFeedbackOpen((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </IconButton>

          {/* Documentation Drawer Trigger */}
          <IconButton
            variant={activeDrawer === "help" ? "soft" : "surface"}
            color={activeDrawer === "help" ? "gray" : undefined}
            radius="full"
            size="2"
            onClick={() => toggleDrawer("help")}
            style={{ cursor: "pointer" }}
          >
            <QuestionMarkCircledIcon />
          </IconButton>

          {/* Activity Alerts Stream Trigger */}
          <IconButton
            variant={activeDrawer === "notification" ? "soft" : "surface"}
            color={activeDrawer === "notification" ? "gray" : undefined}
            radius="full"
            size="2"
            onClick={() => toggleDrawer("notification")}
            style={{ cursor: "pointer" }}
          >
            <BellIcon />
          </IconButton>

          {/* ================= ACCOUNT PROFILE POPUP ================= */}
          <DropdownMenu.Root>
            {/*  Fix: Combined asChild with layout wrapper box to bridge internal DOM node refs */}
            <DropdownMenu.Trigger asChild>
              <Box style={{ cursor: "pointer", display: "inline-block" }}>
                <Avatar
                  size="2"
                  radius="full"
                  fallback={initials}
                />
              </Box>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content 
              align="end" 
              sideOffset={8}
              style={{ 
                width: "280px",
                padding: "0px",
                overflow: "hidden",
                borderRadius: "10px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px var(--gray-4)",
                backgroundColor: "var(--color-background)"
              }}
            >
              {/* Profile Identity Details */}
              <Box px="4" py="3" style={{ borderBottom: "1px solid var(--gray-4)" }}>
                <Text as="div" size="2" weight="bold" style={{ color: "var(--gray-12)" }} className="truncate">
                  {displayName}
                </Text>
                <Text as="div" size="2" style={{ color: "var(--gray-9)" }} className="truncate">
                  {displayEmail}
                </Text>
              </Box>

              {/* Navigation Actions */}
              <Box py="1" style={{ borderBottom: "1px solid var(--gray-4)" }}>
                <DropdownMenu.Item style={{ padding: "8px 16px", cursor: "pointer" }}>
                  <Flex align="center" gap="3" width="100%">
                    <User size={16} color="var(--gray-9)" />
                    <Text size="2">Account</Text>
                  </Flex>
                </DropdownMenu.Item>
                <DropdownMenu.Item style={{ padding: "8px 16px", cursor: "pointer" }}>
                  <Flex align="center" gap="3" width="100%">
                    <FlaskConical size={16} color="var(--gray-9)" />
                    <Text size="2">Feature previews</Text>
                  </Flex>
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => void refreshSession()} style={{ padding: "8px 16px", cursor: "pointer" }}>
                  <Flex align="center" gap="3" width="100%">
                    <FileText size={16} color="var(--gray-9)" />
                    <Text size="2">Changelog</Text>
                  </Flex>
                </DropdownMenu.Item>
              </Box>

              {/* Layout Theme Radio List */}
              <Box px="4" py="2" style={{ borderBottom: "1px solid var(--gray-4)" }}>
                <Text size="1" weight="medium" style={{ color: "var(--gray-9)", display: "block", marginBottom: "6px" }}>
                  Theme
                </Text>
                <Flex direction="column" gap="1">
                  {themesList.map((t) => (
                    <Flex 
                      key={t}
                      align="center" 
                      gap="3" 
                      py="1" 
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.preventDefault(); // Retain menu open status while swapping preferences
                        setSelectedTheme(t);
                      }}
                    >
                      <Box style={{ 
                        width: "6px", 
                        height: "6px", 
                        borderRadius: "50%", 
                        backgroundColor: selectedTheme === t ? "var(--gray-12)" : "transparent" 
                      }} />
                      <Text size="2" style={{ color: selectedTheme === t ? "var(--gray-12)" : "var(--gray-11)" }}>{t}</Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>


              {/* Conversion/CTA Action Block */}
              <Box px="3" py="3" style={{ borderBottom: "1px solid var(--gray-4)" }}>
                <Button 
                  size="2" 
                  style={{ 
                    width: "100%", 
                    backgroundColor: "#5eead4", 
                    color: "#111827",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Upgrade to Pro
                </Button>
              </Box>

              {/* Session Disconnection */}
              <Box py="1">
                <DropdownMenu.Item color="red" onSelect={signOut} style={{ padding: "8px 16px", cursor: "pointer" }}>
                  <Flex align="center" gap="3" width="100%">
                    <LogOut size={16} />
                    <Text size="2">Log out</Text>
                  </Flex>
                </DropdownMenu.Item>
              </Box>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>

      {/* ================= CONTENT & DRAWER ================= */}
      <Flex style={{ flex: 1, overflow: "hidden" }}>
        <Box style={{ flex: 1, overflowY: "auto", transition: "all 0.3s ease" }}>
          <Container size="4" py="5">
            <Outlet />
          </Container>
        </Box>

        {activeDrawer && (
          <Box style={{ width: activeDrawer === "notification" ? 560 : 420, flexShrink: 0, borderLeft: "1px solid var(--gray-5)", background: "white", overflowY: "auto" }}>
            {activeDrawer === "help" && <HelpDrawer onClose={() => setActiveDrawer(null)} />}
            {activeDrawer === "notification" && <NotificationDrawer onClose={() => setActiveDrawer(null)} />}
          </Box>
        )}
      </Flex>
    </Box>
  );
}