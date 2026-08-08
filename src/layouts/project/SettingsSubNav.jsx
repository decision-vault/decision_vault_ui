import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { Box, Flex, Text, ScrollArea, Separator } from '@radix-ui/themes'
import {
  Settings, Shield, Key, Users, FileText,
  BookOpen, ChevronRight,
} from 'lucide-react'

// ─── Nav structure (mirrors SettingsPage sections) ───────────────────────────
export const SETTINGS_SECTIONS = [
  {
    group: 'Configuration',
    items: [
      { id: 'general',  label: 'General',  icon: Settings },
      { id: 'security', label: 'Security', icon: Shield   },
      { id: 'api-keys', label: 'API Keys', icon: Key      },
    ],
  },

  {
    group: 'Compliance',
    items: [
      { id: 'audit', label: 'Audit Logs', icon: FileText },
      { id: 'legal', label: 'Legal',      icon: BookOpen },
    ],
  },
]

// ─── Single nav item ─────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <Flex
      align="center" gap="3" px="3" py="2"
      onClick={onClick}
      style={{
        borderRadius: 8,
        cursor: 'pointer',
        background: active ? 'var(--accent-3)' : 'transparent',
        color:      active ? 'var(--accent-11)' : 'var(--gray-11)',
        transition: 'background 0.12s ease',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      <Icon size={14} style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }} />
      <Text size="2" weight={active ? 'bold' : 'medium'} style={{ flex: 1 }}>
        {label}
      </Text>
      {active && (
        <ChevronRight size={11} style={{ opacity: 0.4, flexShrink: 0 }} />
      )}
    </Flex>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export function SettingsSubNav() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSection = searchParams.get('section') || 'general'

  const setSection = (id) => {
    setSearchParams({ section: id }, { replace: true })
  }

  return (
    <Box style={{
      width: 220,
      flexShrink: 0,
      borderRight: '1px solid var(--gray-4)',
      background: 'var(--color-panel-background)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Sub-nav header */}
      <Flex
        align="center" px="4"
        style={{
          height: 41,
          borderBottom: '1px solid var(--gray-4)',
          flexShrink: 0,
        }}
      >
        <Settings size={13} color="var(--gray-8)" style={{ marginRight: 8 }} />
        <Text size="2" weight="bold" style={{ color: 'var(--gray-12)', letterSpacing: '-0.1px' }}>
          Settings
        </Text>
      </Flex>

      {/* Nav items */}
      <ScrollArea style={{ flex: 1 }}>
        <Flex direction="column" p="2" gap="0">
          {SETTINGS_SECTIONS.map((section, si) => (
            <Box key={section.group} mb="1">
              {/* Group label */}
              <Text
                size="1" color="gray" weight="bold"
                style={{
                  display: 'block',
                  textTransform: 'uppercase',
                  fontSize: 9,
                  letterSpacing: '0.07em',
                  padding: '8px 12px 4px',
                  opacity: 0.65,
                }}
              >
                {section.group}
              </Text>

              {/* Items */}
              {section.items.map(item => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeSection === item.id}
                  onClick={() => setSection(item.id)}
                />
              ))}

              {/* Divider between groups */}
              {si < SETTINGS_SECTIONS.length - 1 && (
                <Separator size="4" my="2" style={{ opacity: 0.4 }} />
              )}
            </Box>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  )
}
