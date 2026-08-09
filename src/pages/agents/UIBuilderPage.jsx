import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Card, Flex, Heading, Text, Button, Grid, Badge,
  TextArea, Switch, IconButton, Separator
} from '@radix-ui/themes'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CanvasApi } from '../../services/canvasApi'

/* ─── Micro Icons ─────────────────────────────────────────────── */
const IconSparkles = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.886a1 1 0 0 1-.95.684H2.93a1 1 0 0 0-.588 1.81l5.021 3.648a1 1 0 0 1 .364 1.118L5.816 22a1 1 0 0 0 1.54 1.118l5.019-3.647a1 1 0 0 1 1.173 0l5.018 3.647a1 1 0 0 0 1.54-1.118l-1.911-5.854a1 1 0 0 1 .364-1.118l5.022-3.649a1 1 0 0 0-.588-1.81h-6.212a1 1 0 0 1-.95-.684z"/></svg>
const IconMobile    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="10" height="18" x="7" y="3" rx="2"/><path d="M11 18h2"/></svg>
const IconTablet    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="18" x="5" y="3" rx="2"/><path d="M11 18h2"/></svg>
const IconLaptop    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="12" x="4" y="4" rx="2"/><path d="M2 18h20v2H2z"/></svg>
const IconDesktop   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="12" x="3" y="4" rx="2"/><path d="M8 20h8M12 16v4"/></svg>
const IconExpand    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>
const IconMinimize  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="10" x2="3" y1="14" y2="21"/></svg>

/* ─── Element Renderer ────────────────────────────────────────── */
const ELEMENTS_MAP = {
  Box,
  Card: (p) => <Card {...p} style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.06)', ...p.style }} />,
  Flex,
  Grid,
  Heading,
  Text,
  Button: ({ children, ...p }) => {
    const isDefault = !p.color && (!p.variant || p.variant === 'solid')
    const style = isDefault
      ? { background: 'linear-gradient(135deg, var(--violet-9), var(--indigo-9))', color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.28)', ...p.style }
      : p.style
    return <Button {...p} style={style}>{children}</Button>
  },
  Separator,
  Badge,
  TextField: (p) => <input {...p} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--gray-5)', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'var(--color-surface)', color: 'var(--gray-12)', transition: 'border 0.15s', ...p.style }} />,
  Switch: (p) => (
    <Box style={{ display: 'inline-block', width: 34, height: 20, borderRadius: 999, background: p.checked === false ? 'var(--gray-5)' : 'var(--violet-8)', position: 'relative', transition: 'background 0.15s', flexShrink: 0, ...p.style }}>
      <Box style={{ position: 'absolute', top: 2, left: p.checked === false ? 2 : 16, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.15s' }} />
    </Box>
  ),
  Avatar: ({ children, ...p }) => (
    <Box style={{ width: p.size === 2 ? 30 : 24, height: p.size === 2 ? 30 : 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet-6), var(--indigo-6))', color: 'var(--violet-11)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: p.size === 2 ? 11 : 9, flexShrink: 0, ...p.style }}>{children}</Box>
  ),
}

function RenderElement({ node, isWireframe }) {
  if (!node) return null

  if (isWireframe) {
    const wireHeights = { Heading: '22px', Text: '14px', Button: '36px', TextField: '36px', Separator: '2px', Switch: '20px', Avatar: '28px' }
    if (wireHeights[node.element]) {
      return <Box style={{ background: 'var(--gray-5)', height: wireHeights[node.element], width: node.element === 'Text' ? '80%' : '100%', borderRadius: '5px', marginBottom: '10px', opacity: 0.6 }} />
    }
  }

  const Component = ELEMENTS_MAP[node.element]
  if (!Component) {
    return (
      <Box style={{ background: 'var(--gray-2)', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
        <Text size="1" color="gray">{node.content || node.element}</Text>
      </Box>
    )
  }

  const isIntrinsic = node.element === 'TextField'
  if (isIntrinsic) {
    return <Component {...(node.props || {})} />
  }

  return (
    <Component {...(node.props || {})}>
      {node.content}
      {node.children?.map((child, i) => <RenderElement key={i} node={child} isWireframe={isWireframe} />)}
    </Component>
  )
}

/* ─── Device chrome bar (traffic lights + route + expand) ─────── */
function PageChrome({ name, route, onExpand, showExpand }) {
  return (
    <Flex align="center" justify="between" px="3" style={{ background: 'var(--gray-1)', borderBottom: '1px solid var(--gray-4)', borderRadius: '14px 14px 0 0', height: 36, flexShrink: 0, gap: '8px' }}>
      <Flex gap="1" align="center">
        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red-8)' }} />
        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber-8)' }} />
        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-8)' }} />
      </Flex>
      <Badge size="1" variant="soft" color="gray" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route || name}</Badge>
      {showExpand && (
        <IconButton size="1" variant="ghost" color="gray" onClick={() => onExpand && onExpand()} style={{ cursor: 'pointer', background: 'var(--color-surface)', border: '1px solid var(--gray-4)', borderRadius: '6px', height: 24, width: 24 }}>
          <IconExpand />
        </IconButton>
      )}
    </Flex>
  )
}

/* ─── Page Node (ReactFlow custom node) ──────────────────────── */
function PageNode({ data, isWireframe, canvasWidth, onExpand }) {
  return (
    <Box style={{
      width: canvasWidth,
      background: isWireframe ? 'var(--gray-2)' : 'var(--color-surface)',
      border: isWireframe ? '1.5px dashed var(--gray-6)' : '1px solid var(--gray-4)',
      borderRadius: '14px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      transition: 'width 0.25s ease',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <PageChrome name={data.name} route={data.route} onExpand={() => onExpand(data)} showExpand />
      <Box p="4" style={{ background: isWireframe ? 'transparent' : 'linear-gradient(180deg, var(--gray-1), var(--gray-2))', flexGrow: 1 }}>
        {data.content
          ? <RenderElement node={data.content} isWireframe={isWireframe} />
          : <Flex align="center" justify="center" style={{ height: '80px' }}><Text size="1" color="gray">No content defined</Text></Flex>
        }
      </Box>
    </Box>
  )
}

/* ─── Simple label node (for custom/flat nodes from old agent output) */
function CustomNode({ data }) {
  return (
    <Box style={{ background: 'var(--blue-2)', border: '1px solid var(--blue-5)', borderRadius: '12px', padding: '16px 20px', minWidth: '180px', textAlign: 'center' }}>
      <Text size="2" weight="bold" color="blue">{data.label || data.id}</Text>
      {data.description && <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>{data.description}</Text>}
    </Box>
  )
}

/* ─── JSX Code Generator (deterministic, matches the live preview) ── */
const JSX_TAG = {
  Box: 'Box', Card: 'Card', Flex: 'Flex', Grid: 'Grid',
  Heading: 'Heading', Text: 'Text', Button: 'Button',
  Separator: 'Separator', Badge: 'Badge', TextField: 'input',
  Switch: 'Switch', Avatar: 'Avatar',
}

const INPUT_ATTRS = ['placeholder', 'type', 'style', 'disabled', 'required', 'readOnly', 'maxLength', 'name', 'defaultValue', 'value', 'autoFocus']

function _escapeText(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
}

function _serializeProps(element, props) {
  if (!props) return ''
  const parts = []
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue
    if (element === 'TextField' && !INPUT_ATTRS.includes(key)) continue
    if (key === 'style') {
      parts.push(`style={${JSON.stringify(value)}}`)
    } else if (typeof value === 'string') {
      parts.push(`${key}="${value}"`)
    } else {
      parts.push(`${key}={${JSON.stringify(value)}}`)
    }
  }
  return parts.length ? ` ${parts.join(' ')}` : ''
}

function _renderElementToJsx(node, depth = 0) {
  if (!node) return ''
  const pad = '  '.repeat(depth)
  const padChild = '  '.repeat(depth + 1)
  const tag = JSX_TAG[node.element] || node.element
  const attrs = _serializeProps(node.element, node.props)

  if (node.element === 'Avatar') {
    const fb = String(node.content ?? 'AB').replace(/"/g, '&quot;')
    return `${pad}<Avatar${attrs} fallback="${fb}" />`
  }

  if (node.element === 'TextField') return `${pad}<${tag}${attrs} />`

  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  if (!hasChildren) {
    if (node.content) return `${pad}<${tag}${attrs}>${_escapeText(node.content)}</${tag}>`
    return `${pad}<${tag}${attrs} />`
  }

  const lines = []
  if (node.content) lines.push(`${padChild}${_escapeText(node.content)}`)
  node.children.forEach((child) => {
    lines.push(_renderElementToJsx(child, depth + 1))
  })
  return `${pad}<${tag}${attrs}>\n${lines.join('\n')}\n${pad}</${tag}>`
}

function pageToJsx(page) {
  if (!page) return '// No page content'
  const name = (page.name || 'Page')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/).filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1)).join('') || 'Page'
  const componentName = `${name}Screen`
  const imports = ['Box', 'Card', 'Flex', 'Grid', 'Heading', 'Text', 'Button', 'Separator', 'Badge', 'Switch', 'Avatar']

  const body = _renderElementToJsx(page.content, 2)

  return `import { ${imports.join(', ')} } from '@radix-ui/themes'\n\n` +
    `export default function ${componentName}() {\n  return (\n${body}\n  )\n}\n`
}

/* ─── Empty State ─────────────────────────────────────────────── */
function EmptyState() {
  return (
    <Flex direction="column" align="center" justify="center" gap="4" style={{ height: '100%', padding: '60px 40px' }}>
      <Box style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'var(--violet-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--violet-9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 9h6M9 12h6M9 15h4"/>
        </svg>
      </Box>
      <Flex direction="column" align="center" gap="2">
        <Heading size="4" weight="bold">No wireframes yet</Heading>
        <Text size="2" color="gray" align="center" style={{ maxWidth: '340px', lineHeight: 1.6 }}>
          Generate a task flow first, then come back to build UI wireframes from your tasks.
        </Text>
      </Flex>
    </Flex>
  )
}

/* ─── Generation Progress Bar ─────────────────────────────────── */
function GenerationProgress({ current, total, screenName }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <Flex direction="column" align="center" justify="center" gap="4" style={{ height: '100%', padding: '60px 40px' }}>
      <Box style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'var(--violet-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float-box 3s ease-in-out infinite' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--violet-9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </Box>
      <Flex direction="column" align="center" gap="2">
        <Heading size="4" weight="bold">Generating wireframes</Heading>
        <Text size="2" color="gray" align="center" style={{ maxWidth: '340px', lineHeight: 1.6 }}>
          Designing screen {current} of {total}{screenName ? `: ${screenName}` : ''}...
        </Text>
      </Flex>
      <Box style={{ width: '280px', height: '6px', borderRadius: '3px', background: 'var(--gray-4)', overflow: 'hidden' }}>
        <Box style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', background: 'var(--violet-9)', transition: 'width 0.4s ease' }} />
      </Box>
      <Text size="1" color="gray">{pct}%</Text>
      <style>{`@keyframes float-box { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>
    </Flex>
  )
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function UIBuilderPage({ externalPages, externalEdges, generationProgress }) {
  const { projectId } = useParams()

  const [canvasViewportWidth, setCanvasWidth]   = useState('420px')
  const [activeBreakpointLabel, setBreakLabel]  = useState('Mobile — 420px')
  const [fullScreenPageData, setFullScreen]     = useState(null)
  const [layoutJson, setLayoutJson]             = useState('{}')
  const [isLoading, setIsLoading]               = useState(true)
  const [pageCount, setPageCount]               = useState(0)
  const [previewTab, setPreviewTab]             = useState('preview')
  const [copied, setCopied]                     = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  /* Load canvas from backend */
  useEffect(() => {
    if (!projectId || externalPages) { setIsLoading(false); return }
    setIsLoading(true)
    CanvasApi.getCanvas(projectId)
      .then((data) => {
        if (data?.layout_json) {
          setLayoutJson(JSON.stringify(data.layout_json, null, 2))
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [projectId, externalPages])

  /* Parse JSON */
  const suite = useMemo(() => {
    if (externalPages) return null
    try { return JSON.parse(layoutJson) } catch { return null }
  }, [layoutJson, externalPages])

  /* Build ReactFlow nodes + edges from external pages or parsed suite */
  useEffect(() => {
    const numW = parseInt(canvasViewportWidth) || 420
    const gap  = 80

    // External progressive pages from streaming
    if (externalPages?.length) {
      setPageCount(externalPages.length)
      const mappedNodes = externalPages.map((page, i) => ({
        id: page.id,
        type: 'pageNode',
        data: { id: page.id, name: page.name, route: page.route, content: page.content },
        position: { x: i * (numW + gap) + 80, y: 100 }
      }))
      setNodes(mappedNodes)

      const mappedEdges = (externalEdges || []).map(e => ({
        ...e,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--violet-8)' },
        style: { stroke: 'var(--violet-7)', strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: 'var(--gray-9)' },
        labelBgStyle: { fill: 'var(--color-surface)', rx: 4 }
      }))
      setEdges(mappedEdges)
      return
    }

    // Canvas API data
    if (!suite) return

    if (suite.pages?.length) {
      setPageCount(suite.pages.length)
      const mappedNodes = suite.pages.map((page, i) => ({
        id: page.id,
        type: 'pageNode',
        data: { id: page.id, name: page.name, route: page.route, content: page.content },
        position: { x: i * (numW + gap) + 80, y: 100 }
      }))
      setNodes(mappedNodes)

      const mappedEdges = (suite.edges || []).map(e => ({
        ...e,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--blue-8)' },
        style: { stroke: 'var(--blue-7)', strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: 'var(--gray-9)' },
        labelBgStyle: { fill: 'var(--color-surface)', rx: 4 }
      }))
      setEdges(mappedEdges)
      return
    }

    if (suite.nodes?.length) {
      setPageCount(suite.nodes.length)
      const mappedNodes = suite.nodes.map((nd, i) => ({
        ...nd,
        type: 'customNode',
        position: nd.position || { x: i * 260 + 80, y: 120 }
      }))
      setNodes(mappedNodes)
      const mappedEdges = (suite.edges || []).map(e => ({
        ...e,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--blue-8)' },
        style: { stroke: 'var(--blue-7)', strokeWidth: 1.5 }
      }))
      setEdges(mappedEdges)
    }
  }, [suite, externalPages, externalEdges, canvasViewportWidth, setNodes, setEdges])

  const updateBreakpoint = (w, label) => { setCanvasWidth(w); setBreakLabel(label) }

  const generatedCode = useMemo(() => (fullScreenPageData ? pageToJsx(fullScreenPageData) : ''), [fullScreenPageData])

  useEffect(() => { setPreviewTab('preview'); setCopied(false) }, [fullScreenPageData?.id])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const nodeTypes = useMemo(() => ({
    pageNode: ({ data }) => (
      <PageNode
        data={data}
        isWireframe={false}
        canvasWidth={canvasViewportWidth}
        onExpand={setFullScreen}
      />
    ),
    customNode: ({ data }) => <CustomNode data={data} />,
    custom:     ({ data }) => <CustomNode data={data} />,
  }), [canvasViewportWidth])

  const hasContent = externalPages?.length > 0 || (suite?.pages?.length > 0) || (suite?.nodes?.length > 0)

  /* ── Full-screen overlay ── */
  if (fullScreenPageData) {
    return (
      <Box style={{ height: '100vh', width: '100vw', background: 'var(--gray-2)', display: 'flex', flexDirection: 'column', overflow: 'auto', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
        <Flex p="3" justify="between" align="center" gap="3" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--gray-4)', boxShadow: 'var(--shadow-2)', flexShrink: 0 }}>
          <Flex align="center" gap="3">
            <Heading size="4" weight="bold">{fullScreenPageData.name}</Heading>
            {fullScreenPageData.route && <Badge color="blue" size="1" variant="soft">{fullScreenPageData.route}</Badge>}
            <Badge color={previewTab === 'code' ? 'violet' : 'blue'} size="1">{previewTab === 'code' ? 'Generated Code' : 'Live Preview'}</Badge>
          </Flex>
          <Flex align="center" gap="2" style={{ flexWrap: 'wrap' }}>
            <Flex style={{ background: 'var(--gray-2)', border: '1px solid var(--gray-4)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
              <Button size="1" variant={previewTab === 'preview' ? 'solid' : 'ghost'} color={previewTab === 'preview' ? 'violet' : 'gray'} onClick={() => setPreviewTab('preview')} style={{ cursor: 'pointer' }}>Preview</Button>
              <Button size="1" variant={previewTab === 'code' ? 'solid' : 'ghost'} color={previewTab === 'code' ? 'violet' : 'gray'} onClick={() => setPreviewTab('code')} style={{ cursor: 'pointer' }}>Code</Button>
            </Flex>
            {previewTab === 'code' && (
              <Button size="2" color={copied ? 'green' : 'gray'} variant="surface" onClick={handleCopyCode} style={{ cursor: 'pointer' }}>
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            )}
            <Button size="2" color="gray" variant="surface" onClick={() => setFullScreen(null)} style={{ cursor: 'pointer', gap: '6px' }}>
              <IconMinimize /> Exit
            </Button>
          </Flex>
        </Flex>

        {previewTab === 'code' ? (
          <Box style={{ flexGrow: 1, overflow: 'auto', padding: '24px' }}>
            <pre style={{ margin: 0, background: 'var(--color-surface)', border: '1px solid var(--gray-4)', borderRadius: '12px', padding: '20px', fontSize: '12.5px', lineHeight: 1.6, color: 'var(--gray-11)', overflow: 'auto', whiteSpace: 'pre', boxShadow: 'var(--shadow-1)' }}>{generatedCode}</pre>
          </Box>
        ) : (
          <Flex style={{ flexGrow: 1 }} align="start" justify="center" p="8">
            <Box style={{ width: '100%', maxWidth: canvasViewportWidth, background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--gray-4)', boxShadow: '0 24px 60px rgba(0,0,0,0.10)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <PageChrome name={fullScreenPageData.name} route={fullScreenPageData.route} />
              <Box p="5" style={{ background: 'linear-gradient(180deg, var(--gray-1), var(--gray-2))' }}>
                {fullScreenPageData.content
                  ? <RenderElement node={fullScreenPageData.content} isWireframe={false} />
                  : <Flex p="8" align="center" justify="center"><Text color="gray">No content</Text></Flex>
                }
              </Box>
            </Box>
          </Flex>
        )}
      </Box>
    )
  }

  /* ── Generation in progress — show progress only until first page arrives ── */
  const showProgress = generationProgress && !externalPages?.length

  if (isLoading) {
    return (
      <Flex p="8" align="center" justify="center" direction="column" gap="3" style={{ height: '100vh', background: 'var(--gray-2)' }}>
        <Box style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--violet-9)', animation: 'bounce-dot 1.2s infinite ease-in-out' }} />
        <Text size="2" color="gray">Loading UI canvas...</Text>
        <style>{`@keyframes bounce-dot { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`}</style>
      </Flex>
    )
  }

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gray-2)' }}>

      {/* ── TOOLBAR ── */}
      <Flex
        px="4" py="2"
        align="center"
        justify="between"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--gray-4)', boxShadow: 'var(--shadow-1)', flexShrink: 0, zIndex: 10 }}
      >
        <Flex align="center" gap="3">
          <Flex align="center" gap="2">
            <Box style={{ color: 'var(--violet-9)', display: 'flex' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 9h6M9 12h6M9 15h4" /></svg>
            </Box>
            <Text size="2" weight="bold">UI Builder</Text>
          </Flex>
          <Separator orientation="vertical" style={{ height: '18px' }} />
          {hasContent
            ? <Badge color="blue" size="1" variant="soft">{pageCount} screen{pageCount !== 1 ? 's' : ''}</Badge>
            : <Badge color="gray" size="1" variant="soft">No wireframes yet</Badge>
          }
          {showProgress && generationProgress.total > 0 && (
            <Badge color="blue" size="1" variant="soft" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
              Designing {generationProgress.current}/{generationProgress.total}
            </Badge>
          )}
        </Flex>

        <Flex align="center" gap="1" style={{ background: 'var(--gray-2)', border: '1px solid var(--gray-4)', borderRadius: '8px', padding: '3px 6px' }}>
          {[
            { w: '320px',  label: 'Mobile 320px',   Icon: IconMobile  },
            { w: '480px',  label: 'Mobile 480px',   Icon: () => <IconMobile style={{ transform: 'rotate(-90deg)' }} /> },
            { w: '768px',  label: 'Tablet 768px',   Icon: IconTablet  },
            { w: '1024px', label: 'Laptop 1024px',  Icon: IconLaptop  },
            { w: '1440px', label: 'Desktop 1440px', Icon: IconDesktop },
          ].map(({ w, label, Icon }) => (
            <IconButton
              key={w}
              size="1"
              variant={canvasViewportWidth === w ? 'solid' : 'ghost'}
              color={canvasViewportWidth === w ? 'violet' : 'gray'}
              onClick={() => updateBreakpoint(w, label)}
              title={label}
              style={{ cursor: 'pointer' }}
            >
              <Icon />
            </IconButton>
          ))}
        </Flex>
      </Flex>

      {/* ── MAIN WORKSPACE ── */}
      <Box style={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
        {!hasContent && !showProgress ? (
          <Box style={{ height: '100%', background: 'var(--gray-1)' }}>
            <EmptyState />
          </Box>
        ) : !hasContent && showProgress ? (
          <Box style={{ height: '100%', background: 'var(--gray-1)' }}>
            <GenerationProgress
              current={generationProgress.current}
              total={generationProgress.total}
              screenName={generationProgress.screenName}
            />
          </Box>
        ) : (
          <Box style={{ height: '100%', width: '100%', position: 'relative' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              style={{ background: 'var(--gray-1)' }}
              panOnDrag
              minZoom={0.2}
              maxZoom={2}
            >
              <Controls style={{ background: 'var(--color-surface)', border: '1px solid var(--gray-4)', borderRadius: '8px' }} />
              <Background variant="dots" gap={28} size={1} color="var(--gray-4)" />
            </ReactFlow>
            {showProgress && (
              <Box style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-surface)', border: '1px solid var(--gray-4)', borderRadius: '12px', padding: '12px 20px', boxShadow: 'var(--shadow-3)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 20 }}>
                <Box style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--violet-9)', animation: 'pulse-dot 1.2s ease-in-out infinite' }} />
                <Text size="2" weight="medium">Designing screen {generationProgress.current} of {generationProgress.total}</Text>
                <Text size="1" color="gray">{generationProgress.screenName}</Text>
                <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
