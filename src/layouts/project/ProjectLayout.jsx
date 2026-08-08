import { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate, Outlet } from "react-router-dom";
import { listOrganizations } from "../../services/orgApi";
import { useTheme } from "../../components/SystemTheme.jsx";
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  IconButton,
  Avatar,
  DropdownMenu,
  Kbd,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  QuestionMarkCircledIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BellIcon,
} from "@radix-ui/react-icons";
import { 
  User, 
  FlaskConical, 
  FileText, 
  ChevronRight,
  LogOut,
  Check
} from "lucide-react";

import logo from "../../assets/logo.svg";
import { useAuth } from "../../auth/AuthContext";

// Import the tools built for the org/project layouts
import HelpDrawer from "../../components/org/HelpDrawer";
import NotificationDrawer from "../../components/org/NotificationDrawer";
import SearchDialog from "../../components/org/SearchDialog";
import FeedbackDialog from "../../components/org/FeedbackDialog";
import { ProjectSidebar } from "./ProjectSidebar";
import { SettingsSubNav } from "./SettingsSubNav";

const PROJECT_NAMES = {
  "1": "meny-app",
};

function getContextTitle(pathname, projectId) {
  if (pathname.endsWith("/new")) return "New project";
  if (pathname.includes("/llm-config")) return "LLM config";
  if (pathname.includes("/settings")) return "Settings";
  if (pathname.includes("/dashboard")) return "Dashboard";
  if (projectId && PROJECT_NAMES[projectId]) return PROJECT_NAMES[projectId];
  return "Projects";
}

export function ProjectLayout() {
  const { projectId, orgId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionUser, refreshSession, signOut } = useAuth();
  
  const orgName = sessionUser?.tenant_name || "Organization";
  const contextTitle = getContextTitle(location.pathname, projectId);
  const isSettingsPage = location.pathname.endsWith("/settings") || location.pathname.includes("/settings/");

  const [orgs, setOrgs] = useState([]);

  // Layout states for modals/drawers
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(themeMode);

  useEffect(() => {
    let mounted = true;
    listOrganizations()
      .then((res) => {
        if (mounted) {
          setOrgs(res.orgs || []);
        }
      })
      .catch((err) => console.error("Failed to list organizations", err));
    return () => {
      mounted = false;
    };
  }, []);

  // Parse display parameters
  const displayName = sessionUser?.email ? sessionUser.email.split("@")[0] : "kaviyarasumaran";
  const displayEmail = sessionUser?.email || "kaviyarasumaran@gmail.com";

  const initials =
    displayEmail
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "DV";

  const toggleDrawer = (drawerName) => {
    setActiveDrawer((prev) => (prev === drawerName ? null : drawerName));
  };

  const themesList = ["System", "Dark", "Light"];

  return (
    <Box
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      
      {/* Dynamic Context Overlays */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />

      {/* ================= HEADER ================= */}
      <Flex
        align="center"
        justify="between"
        gap="4"
        px="5"
        style={{
          height: "60px",
          borderBottom: "1px solid var(--gray-5)",
          background: "var(--color-panel-solid)",
          flexShrink: 0,
        }}
      >
        {/* Left Side Breadcrumbs */}
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
            <img src={logo} alt="DecisionVault logo" />
          </Box>

          <ChevronRightIcon color="gray" />

          <Flex align="center" gap="2">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Flex
                  align="center"
                  gap="1"
                  style={{ cursor: "pointer", userSelect: "none", marginLeft: 4 }}
                >
                  <Text size="2" color="gray" weight="medium">
                    {orgName}
                  </Text>
                  <ChevronDownIcon
                    width="14"
                    height="14"
                    style={{ color: "var(--gray-8)" }}
                  />
                </Flex>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="start" size="2">
                <DropdownMenu.Label>Switch Organization</DropdownMenu.Label>
                {orgs.map((org) => {
                  const isActive = org.id === orgId || org.name === orgName;
                  return (
                    <DropdownMenu.Item
                      key={org.id}
                      onSelect={() => navigate(`/organizations/${org.id}/projects`)}
                      style={{ fontWeight: isActive ? "bold" : "normal" }}
                    >
                      {org.name} {isActive ? <Check size={12} style={{ verticalAlign: 'middle', marginLeft: 4 }} /> : ""}
                    </DropdownMenu.Item>
                  );
                })}
                <DropdownMenu.Separator />
                <DropdownMenu.Item onSelect={() => navigate("/organizations/new")}>
                  Create organization
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>

          <ChevronRightIcon color="gray" />
          <Text size="2" weight="medium" style={{ color: "var(--gray-12)" }}>
            {contextTitle}
          </Text>
        </Flex>

        {/* Right Side Dock Actions */}
        <Flex align="center" gap="3">
          
          {/* Custom Context-Aware Feedback Toggle Button */}
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

          {/* Search Trigger Button */}
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
                transition: "all 0.2s ease",
              }}
            >
              <Flex align="center" gap="2">
                <MagnifyingGlassIcon />
                <Text size="2">Search...</Text>
              </Flex>
              <Kbd size="1">⌘K</Kbd>
            </Flex>
          </Box>

          {/* Help Drawer Toggle */}
          <IconButton
            variant={activeDrawer === "help" ? "soft" : "surface"}
            color={activeDrawer === "help" ? "gray" : undefined}
            size="2"
            radius="full"
            aria-label="Help"
            onClick={() => toggleDrawer("help")}
            style={{ cursor: "pointer" }}
          >
            <QuestionMarkCircledIcon width="18" height="18" />
          </IconButton>

          {/* Notification Drawer Toggle */}
          <IconButton
            variant={activeDrawer === "notification" ? "soft" : "surface"}
            color={activeDrawer === "notification" ? "gray" : undefined}
            size="2"
            radius="full"
            aria-label="Notifications"
            onClick={() => toggleDrawer("notification")}
            style={{ cursor: "pointer" }}
          >
            <BellIcon width="18" height="18" />
          </IconButton>

          {/* ================= CUSTOM PROFILE POPUP ================= */}
          <DropdownMenu.Root>
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

              {/* Navigation Links Group */}
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

              {/* Layout Theme List */}
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
                        e.preventDefault(); 
                        setSelectedTheme(t);
                        setThemeMode(t);
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

              {/* Localization Context */}
              <Box py="1" style={{ borderBottom: "1px solid var(--gray-4)" }}>
                <DropdownMenu.Item style={{ padding: "8px 16px", cursor: "pointer" }}>
                  <Flex align="center" justify="between" width="100%">
                    <Box>
                      <Text as="div" size="2" style={{ color: "var(--gray-12)" }}>Timezone</Text>
                      <Text as="div" size="1" style={{ color: "var(--gray-9)" }}>Auto (Asia/Calcutta)</Text>
                    </Box>
                    <ChevronRight size={14} color="var(--gray-8)" />
                  </Flex>
                </DropdownMenu.Item>
              </Box>

              {/* CTA Upgrade Trigger */}
              <Box px="3" py="3" style={{ borderBottom: "1px solid var(--gray-4)" }}>
                {/*  THEME FIX: Swapped hardcoded hex values with native theme properties */}
                <Button 
                  size="2" 
                  style={{ 
                    width: "100%", 
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Upgrade to Pro
                </Button>
              </Box>

              {/* Terminate Session Action */}
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
        
        {/*  NAVIGATION INJECTION: Anchored persistent sidebar alongside routing pane */}
        <ProjectSidebar />

        {/*  SETTINGS SUB-NAV: Render settings sub-navigation dynamically on settings pages */}
        {isSettingsPage && <SettingsSubNav />}

        {/* Main Application Content Pane */}
        <Box
          style={{
            flex: 1,
            overflowY: "auto",
            transition: "all 0.3s ease",
          }}
        >
          {location.pathname.includes("/mvp/doc") || isSettingsPage ? (
            <Outlet />
          ) : (
            <Container size="4" py="5">
              <Outlet />
            </Container>
          )}
        </Box>

        {/* Side Drawer Panes */}
        {activeDrawer && (
          <Box
            style={{
              width: activeDrawer === "notification" ? 560 : 420,
              flexShrink: 0,
              borderLeft: "1px solid var(--gray-4)",
              background: "var(--color-panel-solid)",
              overflowY: "auto",
            }}
          >
            {activeDrawer === "help" && (
              <HelpDrawer onClose={() => setActiveDrawer(null)} />
            )}

            {activeDrawer === "notification" && (
              <NotificationDrawer onClose={() => setActiveDrawer(null)} />
            )}
          </Box>
        )}
      </Flex>
    </Box>
  );
}