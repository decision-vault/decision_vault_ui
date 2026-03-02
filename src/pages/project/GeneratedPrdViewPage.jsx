import { useEffect, useState } from 'react'
import { Box, Button, DropdownMenu, Flex, Heading, Select, Spinner, Text, TextArea } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowUpIcon } from '@radix-ui/react-icons'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  exportLlmPrd,
  getLatestLlmPrd,
  getLatestRequirementsSystemDesign,
  getLlmPrdVersion,
  getLlmPrdVersions,
  getRequirementsSystemDesignVersion,
  getRequirementsSystemDesignVersions,
} from '../../services/requirementsApi'
import { MarkdownDocViewer } from '../../components/docs/MarkdownDocViewer'

export function GeneratedPrdViewPage() {
  const { orgId, projectId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const queryType = searchParams.get('type')
  const docType = (location.state?.docType || (queryType === 'sdd' ? 'SDD' : 'PRD'))
  const [prdMarkdown, setPrdMarkdown] = useState(location.state?.docMarkdown || location.state?.prdMarkdown || '')
  const [prdVersion, setPrdVersion] = useState(location.state?.docVersion || location.state?.prdVersion || null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [exportingType, setExportingType] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!orgId || !projectId) return
      setLoading(true)
      setError('')
      try {
        if (docType === 'SDD') {
          const [latestSdd, sddVersionsResp] = await Promise.all([
            getLatestRequirementsSystemDesign(orgId, projectId),
            getRequirementsSystemDesignVersions(orgId, projectId),
          ])
          if (!mounted) return
          const items = sddVersionsResp?.items || []
          setVersions(items)
          setPrdVersion(latestSdd?.version || null)
          setPrdMarkdown(latestSdd?.content || '')
          return
        }

        const versionsResp = await getLlmPrdVersions(orgId, projectId)
        const items = versionsResp?.items || []
        if (!mounted) return
        setVersions(items)

        const selectedVersion = prdVersion || items?.[0]?.version_number
        if (selectedVersion) {
          const doc = await getLlmPrdVersion(orgId, projectId, selectedVersion)
          if (!mounted) return
          setPrdVersion(doc?.version || selectedVersion)
          setPrdMarkdown(doc?.content || '')
        } else {
          const latest = await getLatestLlmPrd(orgId, projectId)
          if (!mounted) return
          setPrdVersion(latest?.version || null)
          setPrdMarkdown(latest?.content || '')
        }
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Failed to load PRD versions')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [orgId, projectId, docType])

  const handleVersionChange = async (value) => {
    if (!orgId || !projectId || !value) return
    setLoading(true)
    setError('')
    try {
      const versionNo = Number(value)
      const doc = docType === 'SDD'
        ? await getRequirementsSystemDesignVersion(orgId, projectId, versionNo)
        : await getLlmPrdVersion(orgId, projectId, versionNo)
      setPrdVersion(doc?.version || versionNo)
      setPrdMarkdown(doc?.content || '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load selected version')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEdit = () => {
    const msg = chatInput.trim()
    if (!msg) return
    setChatMessages((prev) => [...prev, { role: 'user', text: msg }])
    setChatMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Edit note captured. You can apply this update from the PRD edit workflow.',
      },
    ])
    setChatInput('')
  }

  const handleExport = async (type) => {
    if (!orgId || !projectId) return
    setError('')
    setExportingType(type)
    try {
      const docKind = docType === 'SDD' ? 'sdd' : 'prd'
      const { blob, filename } = await exportLlmPrd(orgId, projectId, type, prdVersion || undefined, docKind)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExportingType('')
    }
  }

  return (
    <Flex style={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      <Box
        style={{
          width: 420,
          minWidth: 420,
          flexShrink: 0,
          borderRight: '1px solid var(--gray-6)',
          background: 'var(--color-panel-translucent)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Flex p="3" align="center" gap="2" style={{ borderBottom: '1px solid var(--gray-6)' }}>
          <Button variant="ghost" size="1" asChild>
            <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard`}>
              <ArrowLeftIcon width="16" height="16" />
            </Link>
          </Button>
          <Text size="2" weight="medium">{docType} Chat</Text>
        </Flex>
        <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 12 }}>
          {chatMessages.length === 0 ? (
            <Text size="2" color="gray">Add edit requests for this {docType}.</Text>
          ) : (
            <Flex direction="column" gap="3">
              {chatMessages.map((m, i) => (
                <Box
                  key={i}
                  p="2"
                  style={{
                    background: m.role === 'user' ? 'var(--accent-3)' : 'var(--gray-3)',
                    borderRadius: 'var(--radius-2)',
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  <Text size="2">{m.text}</Text>
                </Box>
              ))}
            </Flex>
          )}
        </Box>
        <Flex p="3" gap="2" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <TextArea
            placeholder="Describe the edit you want..."
            size="2"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendEdit()
              }
            }}
            style={{ flex: 1, minHeight: 44, resize: 'none' }}
          />
          <Button size="2" onClick={handleSendEdit} disabled={!chatInput.trim()}>
            <ArrowUpIcon width="16" height="16" />
          </Button>
        </Flex>
      </Box>

      <Box p="6" style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto' }}>
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between">
            <Button variant="soft" asChild>
              <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard`}>
                <ArrowLeftIcon /> Back
              </Link>
            </Button>
            <Flex align="center" gap="3">
              <Select.Root
                  value={prdVersion ? String(prdVersion) : undefined}
                  onValueChange={handleVersionChange}
                  disabled={versions.length === 0}
                >
                  <Select.Trigger placeholder="Select version" />
                  <Select.Content>
                    {versions.map((v) => (
                      <Select.Item key={String(v.version_number)} value={String(v.version_number)}>
                        {`Version ${v.version_number}`}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              {prdVersion ? <Text size="2" color="gray">Version {prdVersion}</Text> : null}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button size="1" variant="soft" disabled={loading || !prdMarkdown || exportingType !== ''}>
                      {exportingType ? `Exporting ${exportingType.toUpperCase()}…` : 'Export'}
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onSelect={() => handleExport('md')}>Export as Markdown (.md)</DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={() => handleExport('pdf')}>Export as PDF (.pdf)</DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={() => handleExport('doc')}>Export as DOC (.doc)</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
            </Flex>
          </Flex>
          <Heading size="5">{`Generated ${docType}`}</Heading>
          {error ? <Text color="red">{error}</Text> : null}
          {loading ? (
            <Flex align="center" gap="2">
              <Spinner />
              <Text color="gray">{`Loading ${docType}…`}</Text>
            </Flex>
          ) : null}
          {prdMarkdown ? (
            <Box
              className="md-doc-viewer"
              p="4"
              style={{
                border: '1px solid var(--gray-6)',
                borderRadius: 'var(--radius-3)',
                background: 'var(--color-panel-solid)',
              }}
            >
              <MarkdownDocViewer markdown={prdMarkdown} />
            </Box>
          ) : (
            <Text color="gray">{`No ${docType} content found to display.`}</Text>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}
