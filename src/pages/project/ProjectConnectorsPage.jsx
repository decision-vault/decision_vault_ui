import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Spinner,
  Grid,
  Separator,
} from '@radix-ui/themes'
import {
  ChatBubbleIcon,
  GlobeIcon,
  LightningBoltIcon,
  LaptopIcon,
  Link2Icon,
} from '@radix-ui/react-icons'
import {
  disconnectConnector,
  getConnectorStartUrl,
  listConnectors,
} from '../../services/connectorApi'

export function ProjectConnectorsPage() {
  const { orgId } = useParams()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBusyProvider, setIsBusyProvider] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await listConnectors(orgId)
      setItems(data?.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connectors')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [orgId])

  useEffect(() => {
    const onFocus = () => {
      void load()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [orgId])

  const onConnect = async (provider) => {
    setIsBusyProvider(provider)
    setError('')
    try {
      const data = await getConnectorStartUrl(orgId, provider)
      if (data?.start_url) {
        window.open(data.start_url, '_blank', 'noopener,noreferrer')
        let attempts = 0
        const timer = window.setInterval(async () => {
          attempts += 1
          await load()
          if (attempts >= 20) {
            window.clearInterval(timer)
          }
        }, 3000)
      } else if (data?.detail) {
        setError(data.detail)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open connector setup')
    } finally {
      setIsBusyProvider('')
    }
  }

  const onDisconnect = async (provider) => {
    setIsBusyProvider(provider)
    setError('')
    try {
      await disconnectConnector(orgId, provider)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setIsBusyProvider('')
    }
  }

  const slackConnector = items.find((item) => item.provider === 'slack') || {
    provider: 'slack',
    connected: false,
    connected_at: null,
  }
  const ordered = [slackConnector]
  const comingSoon = ['teams', 'zoom', 'google_chat', 'custom']

  const providerMeta = {
    slack: { label: 'Slack', short: 'SL', hint: 'Channels, threads, and decisions', tone: '#611F69' },
    teams: { label: 'Microsoft Teams', short: 'MS', hint: 'Team channels and messages', tone: '#4F52B2' },
    zoom: { label: 'Zoom', short: 'ZM', hint: 'Meeting and chat signals', tone: '#2D8CFF' },
    google_chat: { label: 'Google Chat', short: 'GC', hint: 'Spaces and thread activity', tone: '#34A853' },
    custom: { label: 'Custom API', short: 'API', hint: 'Push decisions via webhook/API', tone: '#6D28D9' },
  }

  const formatDate = (value) => {
    if (!value) return 'Not connected'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Not connected'
    return date.toLocaleString()
  }

  const providerIconMap = {
    slack: ChatBubbleIcon,
    teams: LaptopIcon,
    zoom: GlobeIcon,
    google_chat: LightningBoltIcon,
    custom: Link2Icon,
  }

  const ProviderLogo = ({ provider, connected }) => {
    const meta = providerMeta[provider]
    const Icon = providerIconMap[provider] || Link2Icon
    return (
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: connected ? (meta?.tone || 'var(--gray-9)') : 'var(--gray-3)',
          color: connected ? 'white' : 'var(--gray-11)',
          border: connected ? 'none' : '1px solid var(--gray-6)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon width="16" height="16" />
      </Box>
    )
  }

  const renderConnectorCard = (item) => (
    <Card key={item.provider} size="3" variant="surface">
        <Flex direction="column" gap="3">
        <Flex align="center" justify="between" gap="3">
          <Flex align="center" gap="3" minWidth="0">
            <ProviderLogo provider={item.provider} connected={item.connected} />
            <Flex direction="column" gap="1" minWidth="0">
              <Text size="3" weight="medium" trim="end">
                {providerMeta[item.provider]?.label || item.provider.replace('_', ' ')}
              </Text>
              <Text size="1" color="gray" trim="end">
                {providerMeta[item.provider]?.hint || 'Connector'}
              </Text>
            </Flex>
          </Flex>
            <Flex align="center" gap="2">
              <Badge color={item.connected ? 'green' : 'gray'} variant={item.connected ? 'solid' : 'soft'}>
                {item.connected ? 'CONNECTED' : 'AVAILABLE'}
              </Badge>
            </Flex>
          </Flex>
        <Separator size="4" />
        <Flex align="center" justify="between" wrap="wrap" gap="2">
          <Text size="1" color="gray">
            Last connected: {formatDate(item.connected_at)}
          </Text>
          {item.connected ? (
            <Button
              size="2"
              variant="soft"
              color="red"
              disabled={isBusyProvider === item.provider}
              onClick={() => void onDisconnect(item.provider)}
            >
              {isBusyProvider === item.provider ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          ) : (
            <Button
              size="2"
              disabled={isBusyProvider === item.provider}
              onClick={() => void onConnect(item.provider)}
            >
              {isBusyProvider === item.provider ? 'Opening...' : 'Connect'}
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  )

  return (
    <Box p="6">
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between" wrap="wrap" gap="3">
          <Box>
            <Heading size="6">Connectors</Heading>
            <Text size="2" color="gray">
              Configure integrations for decision capture and context sync.
            </Text>
          </Box>
          <Button variant="soft" size="2" onClick={() => void load()} disabled={isLoading}>
            Refresh
          </Button>
        </Flex>
        {isLoading ? (
          <Flex justify="center" p="6">
            <Spinner />
          </Flex>
        ) : null}
        {error ? (
          <Text size="2" color="red">
            {error}
          </Text>
        ) : null}
        {!isLoading ? (
        <Flex direction="column" gap="3">
            <Heading size="4">Slack Connector</Heading>
            {ordered.length > 0 ? (
              <Grid columns={{ initial: '1', md: '2' }} gap="3">
                {ordered.map(renderConnectorCard)}
              </Grid>
            ) : null}
            <Heading size="4" mt="2">Coming Soon</Heading>
            <Grid columns={{ initial: '1', md: '2' }} gap="3">
              {comingSoon.map((provider) => (
                <Card key={provider} size="3" variant="surface">
                  <Flex direction="column" gap="3">
                    <Flex align="center" gap="3">
                      <ProviderLogo provider={provider} connected={false} />
                      <Flex direction="column" gap="1">
                        <Text size="3" weight="medium">
                          {providerMeta[provider]?.label || provider.replace('_', ' ')}
                        </Text>
                        <Badge color="gray" variant="soft">COMING SOON</Badge>
                      </Flex>
                    </Flex>
                    <Text size="1" color="gray">
                      {providerMeta[provider]?.hint}
                    </Text>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </Flex>
        ) : null}
      </Flex>
    </Box>
  )
}
