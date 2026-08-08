import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  Select,
  TextField,
  Button,
  Badge,
  Switch,
  Separator,
  ScrollArea,
} from '@radix-ui/themes'
import { Cpu } from 'lucide-react'

export function ProjectLlmConfigPage() {
  const { projectId } = useParams()
  const storageKey = `dv_llm_config_${projectId || 'global'}`
  const [provider, setProvider] = useState('gemini')
  const [modelName, setModelName] = useState('')
  const [customBaseUrl, setCustomBaseUrl] = useState('')
  const [customApiKey, setCustomApiKey] = useState('')
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [configs, setConfigs] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setConfigs(
            parsed.map((item) => ({
              ...item,
              enabled: item.enabled ?? item.is_active ?? true,
              is_active: item.is_active ?? false,
              connected: item.connected ?? true,
            })),
          )
        }
      }
    } catch {
      // ignore bad cache
    }
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(configs))
  }, [configs, storageKey])

  const activeConfig = useMemo(
    () => configs.find((item) => item.is_active && item.enabled),
    [configs],
  )
  const enabledCount = useMemo(() => configs.filter((item) => item.enabled).length, [configs])

  const onAddConfig = () => {
    if (!modelName.trim()) return
    if (provider === 'custom' && (!customBaseUrl.trim() || !customApiKey.trim())) return
    const id = `${provider}:${modelName.trim().toLowerCase()}`
    const alreadyExists = configs.some((item) => item.id === id)
    if (alreadyExists) return
    const config = {
      id,
      provider,
      model_name: modelName.trim(),
      base_url: provider === 'custom' ? customBaseUrl.trim() : null,
      api_key_masked: provider === 'custom' ? `${customApiKey.trim().slice(0, 4)}••••` : null,
      enabled: true,
      is_active: configs.length === 0,
      connected: provider === 'custom' ? true : true,
    }
    setConfigs((prev) => [...prev, config])
    setModelName('')
    setCustomBaseUrl('')
    setCustomApiKey('')
  }

  const onSetActive = (id) => {
    setConfigs((prev) =>
      prev.map((item) => ({
        ...item,
        is_active: item.enabled && item.id === id,
      })),
    )
  }

  const onToggleEnabled = (id, enabled) => {
    setConfigs((prev) => {
      const next = prev.map((item) => {
        if (item.id !== id) return item
        return { ...item, enabled, is_active: enabled ? item.is_active : false }
      })
      const hasActive = next.some((item) => item.is_active && item.enabled)
      if (!hasActive) {
        const firstEnabled = next.find((item) => item.enabled)
        if (firstEnabled) {
          firstEnabled.is_active = true
        }
      }
      return [...next]
    })
  }

  const onRemove = (id) => {
    setConfigs((prev) => {
      const next = prev.filter((item) => item.id !== id)
      if (next.length > 0 && !next.some((item) => item.is_active && item.enabled)) {
        const firstEnabled = next.find((item) => item.enabled)
        if (firstEnabled) firstEnabled.is_active = true
      }
      return [...next]
    })
  }

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* ── Page Header ── */}
      <Flex
        align="center" justify="between" px="6"
        style={{
          borderBottom: '1px solid var(--gray-4)',
          background: 'var(--color-panel-solid)',
          flexShrink: 0,
          height: 41,
        }}
      >
        <Flex align="center" gap="2">
          <Cpu size={14} color="var(--gray-9)" />
          <Text size="2" color="gray">Project</Text>
          <Text size="2" color="gray">/</Text>
          <Text size="3" weight="medium">LLM Config</Text>
        </Flex>
        <Text size="1" color="gray" style={{ fontSize: 10 }}>Manage model connections</Text>
      </Flex>

      <ScrollArea style={{ flex: 1 }}>
      <Box p="6">
      <Flex direction="column" gap="4">
        <Grid columns={{ initial: '1', md: '2' }} gap="3">
          <Card size="2" variant="surface">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Heading size="4">Model Connections</Heading>
                <Button size="2" onClick={() => setShowConnectForm((v) => !v)}>
                  {showConnectForm ? 'Hide Form' : 'Connect LLM'}
                </Button>
              </Flex>
              {showConnectForm ? (
                <>
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">Provider</Text>
                    <Select.Root value={provider} onValueChange={setProvider} size="2">
                      <Select.Trigger variant="surface" />
                      <Select.Content>
                        <Select.Item value="gemini">Gemini</Select.Item>
                        <Select.Item value="openai">OpenAI</Select.Item>
                        <Select.Item value="lmstudio">LM Studio</Select.Item>
                        <Select.Item value="custom">Custom</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">Model</Text>
                    <TextField.Root
                      size="2"
                      placeholder="gemini-2.0-flash"
                      value={modelName}
                      onChange={(event) => setModelName(event.target.value)}
                    />
                  </Flex>
                  {provider === 'custom' ? (
                    <>
                      <Flex direction="column" gap="1">
                        <Text size="2" weight="medium">Custom Base URL</Text>
                        <TextField.Root
                          size="2"
                          placeholder="https://api.provider.com/v1"
                          value={customBaseUrl}
                          onChange={(event) => setCustomBaseUrl(event.target.value)}
                        />
                      </Flex>
                      <Flex direction="column" gap="1">
                        <Text size="2" weight="medium">Custom API Key</Text>
                        <TextField.Root
                          size="2"
                          placeholder="sk-..."
                          value={customApiKey}
                          onChange={(event) => setCustomApiKey(event.target.value)}
                        />
                      </Flex>
                    </>
                  ) : null}
                  <Flex justify="end">
                    <Button
                      size="2"
                      onClick={onAddConfig}
                      disabled={!modelName.trim() || (provider === 'custom' && (!customBaseUrl.trim() || !customApiKey.trim()))}
                    >
                      Add model
                    </Button>
                  </Flex>
                </>
              ) : (
                <Text size="2" color="gray">
                  Click "Connect LLM" to add a model configuration.
                </Text>
              )}
            </Flex>
          </Card>
          <Card size="2" variant="surface">
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">
                Active Model
              </Text>
              <Text size="3" weight="medium">
                {activeConfig ? `${activeConfig.provider} / ${activeConfig.model_name}` : 'Not set'}
              </Text>
              <Text size="2" color="gray">
                Enabled models: {enabledCount}
              </Text>
              <Text size="2" color="gray">
                Use one active model at runtime; disable others as needed.
              </Text>
            </Flex>
          </Card>
        </Grid>

        <Grid columns={{ initial: '1', md: '2' }} gap="3">
          {configs.length === 0 ? (
            <Card size="2" variant="surface">
              <Text size="2" color="gray">
                No models configured yet.
              </Text>
            </Card>
          ) : null}
          {configs.map((item) => (
            <Card key={item.id} size="2" variant="surface">
              <Flex direction="column" gap="3">
                <Flex align="center" justify="between" wrap="wrap" gap="3">
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">
                      {item.provider} / {item.model_name}
                    </Text>
                    <Flex align="center" gap="2">
                      <Badge color={item.enabled ? 'green' : 'gray'}>
                        {item.enabled ? 'ENABLED' : 'DISABLED'}
                      </Badge>
                      {item.is_active && item.enabled ? <Badge color="blue">ACTIVE</Badge> : null}
                      {item.connected ? <Badge color="blue" variant="soft">CONNECTED</Badge> : null}
                    </Flex>
                    {item.provider === 'custom' ? (
                      <Text size="1" color="gray">
                        {item.base_url} · {item.api_key_masked}
                      </Text>
                    ) : null}
                  </Flex>
                  <Flex align="center" gap="2">
                    <Text size="1" color="gray">
                      Enabled
                    </Text>
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={(checked) => onToggleEnabled(item.id, checked)}
                    />
                  </Flex>
                </Flex>
                <Separator size="4" />
                <Flex gap="2" justify="end">
                  <Button
                    size="1"
                    variant={item.is_active && item.enabled ? 'soft' : 'solid'}
                    disabled={!item.enabled || (item.is_active && item.enabled)}
                    onClick={() => onSetActive(item.id)}
                  >
                    {item.is_active && item.enabled ? 'Active' : 'Set Active'}
                  </Button>
                  <Button size="1" variant="soft" color="red" onClick={() => onRemove(item.id)}>
                    Remove
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Grid>

      </Flex>
      </Box>
      </ScrollArea>
    </Box>
  )
}
