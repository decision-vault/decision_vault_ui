import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Flex, ScrollArea, DropdownMenu, Text, IconButton } from '@radix-ui/themes'
import { useTheme } from '../../components/SystemTheme.jsx'
import { 
  User, 
  FileText, 
  ChevronRight,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  Kanban,
  GitBranch,
  Bot,
  Layout,
  FolderOpen,
  Code2,
  Users
} from 'lucide-react'

import logo from '../../assets/logo.svg'
import { useAuth } from '../../auth/AuthContext'
import { AccountProjectsList } from '../../components/org/AccountProjectsList'

function NavItem({ to, icon: Icon, active, label, isCollapsed }) {
  return (
    <Box
      asChild
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 8,
        background: active ? 'var(--accent-3)' : 'transparent',
      }}
    >
      <Link to={to}>
        <Flex 
          align="center" 
          justify={isCollapsed ? 'center' : 'start'} 
          gap="3" 
          px={isCollapsed ? '2' : '3'} 
          py="2" 
          style={{ height: 34, transition: 'all 0.15s ease' }}
        >
          <Icon width="15" height="15" style={{ color: active ? 'var(--accent-11)' : 'var(--gray-10)', flexShrink: 0 }} />
          {!isCollapsed && (
            <Text size="2" weight={active ? 'bold' : 'medium'} style={{ color: active ? 'var(--accent-11)' : 'var(--gray-12)', whiteSpace: 'nowrap' }}>
              {label}
            </Text>
          )}
        </Flex>
      </Link>
    </Box>
  )
}

export function DashboardSidebar({ isCollapsed, setIsCollapsed }) {
  const { orgId: paramOrgId, projectId: paramProjectId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { sessionUser, refreshSession, signOut } = useAuth()
  const { mode: themeMode, setMode: setThemeMode } = useTheme()
  
  const [selectedTheme, setSelectedTheme] = useState(themeMode)
  const pathParts = location.pathname.split('/')
  const orgIndex = pathParts.indexOf('organizations')
  const projectIndex = pathParts.indexOf('projects')
  
  const orgId = paramOrgId || (orgIndex !== -1 ? pathParts[orgIndex + 1] : null)
  const projectId = paramProjectId || (projectIndex !== -1 ? pathParts[projectIndex + 1] : null)

  const displayName = sessionUser?.email ? sessionUser.email.split('@')[0] : 'kaviyarasumaran'
  const displayEmail = sessionUser?.email || 'kaviyarasumaran@gmail.com'

  const initials =
    displayEmail
      .split(/[@\s]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join('') || 'DV'

  const hasValidIds = orgId && projectId && orgId !== 'undefined' && projectId !== 'undefined'
  
  const projectRoot = `/organizations/${orgId}/projects/${projectId}`
  const baseDashboard = `${projectRoot}/dashboard`

  const items = hasValidIds ? [
    { key: 'agents', label: 'Agents', icon: Bot, to: `${projectRoot}/dashboard/agentsMain`, match: '/dashboard/agentsMain' },
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: baseDashboard, match: '/overview' },
    { key: 'tasks', label: 'Tasks', icon: Kanban, to: `${projectRoot}/tasks`, match: '/tasks' },
    { key: 'workflow', label: 'Workflow', icon: GitBranch, to: `${projectRoot}/workflow`, match: '/workflow' },
    { key: 'ui-builder', label: 'UI Builder', icon: Layout, to: `${projectRoot}/dashboard/ui-builder`, match: '/dashboard/ui-builder' },
    { key: 'document-management', label: 'Documents', icon: FolderOpen, to: `${projectRoot}/dashboard/document-management`, match: '/dashboard/document-management' },
  ] : []

  const isActive = (item) => {
    return location.pathname.includes(item.match)
  }

  const themesList = ['System', 'Dark', 'Light']

  return (
    <Flex
      direction="column"
      style={{
        borderRight: '1px solid var(--gray-6)',
        background: 'var(--color-panel-solid)',
        width: isCollapsed ? '50px' : '220px',
        height: '100vh',
        flexShrink: 0,
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Header Logo */}
      <Flex
        align="center"
        justify={isCollapsed ? 'center' : 'start'}
        gap="3"
        px={isCollapsed ? '0' : '4'}
        py="1"
        style={{ borderBottom: '1px solid var(--gray-6)', height: '41px' }}
      >
        <Box asChild style={{ width: 22, height: 22, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
          <img src={logo} alt="DecisionVault logo" />
        </Box>
        {!isCollapsed && (
          <Text size="2" weight="bold" style={{ color: 'var(--gray-12)', whiteSpace: 'nowrap' }}>
            DecisionVault
          </Text>
        )}
      </Flex>

      {/* Main Navigation Stack */}
      <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1 }}>
        <Flex direction="column" gap="1" p="2">
          {items.map((item) => (
            <NavItem
              key={item.key}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
              active={isActive(item)}
            />
          ))}
        </Flex>
      </ScrollArea>

      {/* ================= UPDATED PROFILE FOOTER POPUP ================= */}
      <Box style={{ borderTop: '1px solid var(--gray-6)' }}>
        <Flex direction="column" gap="2" p="2" align="center">
          <DropdownMenu.Root>
            {/* Fix: Bypassing reference swallowing by passing standard asChild down to a block item wrapper */}
            <DropdownMenu.Trigger asChild>
              <Box style={{ cursor: 'pointer', display: 'inline-block' }}>
                <Avatar size="2" radius="full" fallback={initials} />
              </Box>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Content 
              align="start" 
              side="right" 
              sideOffset={12} 
              style={{ 
                width: '280px',
                padding: '0px',
                overflow: 'hidden',
                borderRadius: '10px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px var(--gray-4)',
                backgroundColor: 'var(--color-background)'
              }}
            >
              {/* Profile Identity Details */}
              <Box px="4" py="3" style={{ borderBottom: '1px solid var(--gray-4)' }}>
                <Text as="div" size="2" weight="bold" style={{ color: 'var(--gray-12)' }} className="truncate">
                  {displayName}
                </Text>
                <Text as="div" size="2" style={{ color: 'var(--gray-9)' }} className="truncate">
                  {displayEmail}
                </Text>
              </Box>

              {/* Navigation Action Links */}
              <Box py="1" style={{ borderBottom: '1px solid var(--gray-4)' }}>
                <DropdownMenu.Item onSelect={() => navigate('profile')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                  <Flex align="center" gap="3" width="100%">
                    <User size={16} color="var(--gray-9)" />
                    <Text size="2">Account</Text>
                  </Flex>
                </DropdownMenu.Item>
                <DropdownMenu.Item style={{ padding: '8px 16px', cursor: 'pointer' }}>
                  <Flex align="center" gap="3" width="100%">
                    <User size={16} color="var(--gray-9)" />
                    <Text size="2">Account</Text>
                  </Flex>
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => void refreshSession()} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                  <Flex align="center" gap="3" width="100%">
                    <FileText size={16} color="var(--gray-9)" />
                    <Text size="2">Changelog</Text>
                  </Flex>
                </DropdownMenu.Item>
              </Box>

              {/* Projects Quick List */}
              <AccountProjectsList orgId={orgId} />

              {/* Layout Theme Swapper Section */}
              <Box px="4" py="2" style={{ borderBottom: '1px solid var(--gray-4)' }}>
                <Text size="1" weight="medium" style={{ color: 'var(--gray-9)', display: 'block', marginBottom: '6px' }}>
                  Theme
                </Text>
                <Flex direction="column" gap="1">
                  {themesList.map((t) => (
                    <Flex 
                      key={t}
                      align="center" 
                      gap="3" 
                      py="1" 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault(); // Intercepts event bubble to retain menu visibility state
                        setSelectedTheme(t);
                        setThemeMode(t);
                      }}
                    >
                      <Box style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        backgroundColor: selectedTheme === t ? 'var(--gray-12)' : 'transparent' 
                      }} />
                      <Text size="2" style={{ color: selectedTheme === t ? 'var(--gray-12)' : 'var(--gray-11)' }}>{t}</Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>

              {/* CTA Upgrade Banner */}
              <Box px="3" py="3" style={{ borderBottom: '1px solid var(--gray-4)' }}>
                <Button 
                  size="2" 
                  style={{ 
                    width: '100%',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Upgrade to Pro
                </Button>
              </Box>

              {/* Session Disconnection */}
              <Box py="1">
                <DropdownMenu.Item color="red" onSelect={signOut} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                  <Flex align="center" gap="3" width="100%">
                    <LogOut size={16} />
                    <Text size="2">Log out</Text>
                  </Flex>
                </DropdownMenu.Item>
              </Box>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Expand / Collapse trigger below the avatar */}
          <IconButton
            variant="ghost"
            color="gray"
            size="2"
            radius="md"
            onClick={() => setIsCollapsed(prev => !prev)}
            style={{ cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'center' }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <Flex align="center" gap="2" style={{ color: 'var(--gray-11)', width: '100%', justifyContent: 'center' }}>
                <ChevronLeft size={14} />
                <Text size="1" color="gray">Collapse</Text>
              </Flex>
            )}
          </IconButton>
        </Flex>
      </Box>
    </Flex>
  )
}
