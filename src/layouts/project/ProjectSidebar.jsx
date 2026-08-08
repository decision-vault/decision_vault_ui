import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Box, Flex, Text, IconButton, Tooltip } from "@radix-ui/themes";
import {
  LayersIcon,
  MixerHorizontalIcon,
  GearIcon,
  DashboardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PersonIcon,
  Component1Icon,
  BarChartIcon,
  CardStackIcon,
} from "@radix-ui/react-icons";

const SIDEBAR_COLLAPSE_KEY = "dv_sidebar_collapsed";

export function ProjectSidebar() {
  const { orgId, projectId } = useParams();
  const location = useLocation();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, isCollapsed);
  }, [isCollapsed]);

  // Unified Organization-level Navigation Items
  const orgNavItems = [
    {
      label: "Projects",
      path: `/organizations/${orgId}/projects`,
      icon: <LayersIcon width="16" height="16" />,
      active: location.pathname.endsWith("/projects"),
    },
    {
      label: "Team",
      path: `/organizations/${orgId}/team`,
      icon: <PersonIcon width="16" height="16" />,
      active: location.pathname.includes("/team"),
    },
    {
      label: "Integrations",
      path: `/organizations/${orgId}/integrations`,
      icon: <Component1Icon width="16" height="16" />,
      active: location.pathname.includes("/integrations"),
    },
    {
      label: "Usage",
      path: `/organizations/${orgId}/usage`,
      icon: <BarChartIcon width="16" height="16" />,
      active: location.pathname.includes("/usage"),
    },
    {
      label: "Billing",
      path: `/organizations/${orgId}/billing`,
      icon: <CardStackIcon width="16" height="16" />,
      active: location.pathname.includes("/billing"),
    },
    {
      label: "Settings",
      path: `/organizations/${orgId}/settings`,
      icon: <GearIcon width="16" height="16" />,
      active: location.pathname === `/organizations/${orgId}/settings` ||
              location.pathname.startsWith(`/organizations/${orgId}/settings/`),
    },
  ];

  // Specific Project Workspace Navigation Tools
  const projectNavItems = projectId
    ? [
        {
          label: "Dashboard",
          path: `/organizations/${orgId}/projects/${projectId}/dashboard`,
          icon: <DashboardIcon width="16" height="16" />,
          active: location.pathname.includes("/dashboard") && !location.pathname.includes("/settings"),
        },
        {
          label: "LLM Config",
          path: `/organizations/${orgId}/projects/${projectId}/llm-config`,
          icon: <MixerHorizontalIcon width="16" height="16" />,
          active: location.pathname.includes("/llm-config"),
        },
        {
          label: "Settings",
          path: `/organizations/${orgId}/projects/${projectId}/dashboard/settings`,
          icon: <GearIcon width="16" height="16" />,
          active: location.pathname.includes("/projects/") && location.pathname.includes("/settings"),
        },
      ]
    : [];

  return (
    <Box
      style={{
        width: isCollapsed ? "64px" : "240px",
        flexShrink: 0,
        borderRight: "1px solid var(--gray-5)",
        background: "var(--color-panel-solid)",
        display: "flex",
        flexDirection: "column",
        padding: "12px",
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
      }}
    >
      {/* Top Section Nav Chains */}
      <Flex direction="column" gap="4" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        
        {/* ================= ORGANIZATION LINKS ================= */}
        <Flex direction="column" gap="1">
          {orgNavItems.map((item) => {
            const content = (
              <Flex
                align="center"
                justify={isCollapsed ? "center" : "start"}
                gap={isCollapsed ? "0" : "3"}
                px="3"
                py="2"
                style={{
                  borderRadius: "6px",
                  backgroundColor: item.active ? "var(--gray-4)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  height: "36px",
                }}
              >
                <Box style={{ color: item.active ? "var(--gray-12)" : "var(--gray-9)", display: "flex", alignItems: "center" }}>
                  {item.icon}
                </Box>
                {!isCollapsed && (
                  <Text
                    size="2"
                    weight={item.active ? "bold" : "regular"}
                    style={{ color: item.active ? "var(--gray-12)" : "var(--gray-11)", whiteSpace: "nowrap" }}
                  >
                    {item.label}
                  </Text>
                )}
              </Flex>
            );

            return (
              <Link key={item.label} to={item.path} style={{ textDecoration: "none", color: "inherit" }}>
                {isCollapsed ? (
                  <Tooltip content={item.label} side="right">
                    {content}
                  </Tooltip>
                ) : (
                  content
                )}
              </Link>
            );
          })}
        </Flex>

        {/* ================= PROJECT LEVEL CONTEXT SECTION ================= */}
        {projectId && (
          <Flex direction="column" gap="1">
            <Box px="3" mb="1" style={{ height: "16px", display: "flex", alignItems: "center" }}>
              {!isCollapsed ? (
                <Text size="1" weight="bold" color="gray" style={{ letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  PROJECT WORKSPACE
                </Text>
              ) : (
                <Box style={{ width: "100%", height: "1px", backgroundColor: "var(--gray-4)" }} />
              )}
            </Box>

            {projectNavItems.map((item) => {
              const content = (
                <Flex
                  align="center"
                  justify={isCollapsed ? "center" : "start"}
                  gap={isCollapsed ? "0" : "3"}
                  px="3"
                  py="2"
                  style={{
                    borderRadius: "6px",
                    backgroundColor: item.active ? "var(--gray-4)" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    height: "36px",
                  }}
                >
                  <Box style={{ color: item.active ? "var(--gray-12)" : "var(--gray-9)", display: "flex", alignItems: "center" }}>
                    {item.icon}
                  </Box>
                  {!isCollapsed && (
                    <Text
                      size="2"
                      weight={item.active ? "bold" : "regular"}
                      style={{ color: item.active ? "var(--gray-12)" : "var(--gray-11)", whiteSpace: "nowrap" }}
                    >
                      {item.label}
                    </Text>
                  )}
                </Flex>
              );

              return (
                <Link key={item.label} to={item.path} style={{ textDecoration: "none", color: "inherit" }}>
                  {isCollapsed ? (
                    <Tooltip content={item.label} side="right">
                      {content}
                    </Tooltip>
                  ) : (
                    content
                  )}
                </Link>
              );
            })}
          </Flex>
        )}
      </Flex>

      {/* ================= BOTTOM COLLAPSE BUTTON ANCHOR ================= */}
      <Flex justify={isCollapsed ? "center" : "end"} mt="auto" pt="2" style={{ borderTop: "1px solid var(--gray-4)" }}>
        <IconButton
          variant="ghost"
          color="gray"
          size="3"
          radius="md"
          onClick={() => setIsCollapsed((prev) => !prev)}
          style={{ cursor: "pointer" }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRightIcon width="18" height="18" />
          ) : (
            <ChevronLeftIcon width="18" height="18" />
          )}
        </IconButton>
      </Flex>
    </Box>
  );
}