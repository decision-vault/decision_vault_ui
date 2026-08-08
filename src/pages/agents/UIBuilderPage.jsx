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
  Box, Card, Flex, Grid, Heading, Text, Button, Separator, Badge,
  TextField: (p) => <input {...p} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gray-5)', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--color-surface)', color: 'var(--gray-12)', ...p.style }} />,
}

function RenderElement({ node, isWireframe }) {
  if (!node) return null

  if (isWireframe) {
    const wireHeights = { Heading: '22px', Text: '14px', Button: '36px', TextField: '36px', Separator: '2px' }
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

/* ─── Page Node (ReactFlow custom node) ──────────────────────── */
function PageNode({ data, isWireframe, canvasWidth, onExpand }) {
  return (
    <Box style={{
      width: canvasWidth,
      background: isWireframe ? 'var(--gray-2)' : 'var(--color-surface)',
      border: isWireframe ? '1.5px dashed var(--gray-6)' : '1px solid var(--gray-4)',
      borderRadius: '14px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      transition: 'width 0.25s ease, background 0.2s ease',
      position: 'relative'
    }}>
      <Box style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 5 }}>
        <IconButton size="1" variant="ghost" color="gray" onClick={() => onExpand(data)} style={{ cursor: 'pointer', background: 'var(--color-surface)', border: '1px solid var(--gray-4)', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <IconExpand />
        </IconButton>
      </Box>
      <Box p="4" style={{ background: isWireframe ? 'transparent' : 'var(--color-surface)', minHeight: '120px' }}>
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
        <Flex p="3" justify="between" align="center" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--gray-4)', boxShadow: 'var(--shadow-2)', flexShrink: 0 }}>
          <Flex align="center" gap="3">
            <Heading size="4" weight="bold">{fullScreenPageData.name}</Heading>
            {fullScreenPageData.route && <Badge color="blue" size="1" variant="soft">{fullScreenPageData.route}</Badge>}
            <Badge color="blue" size="1">Live Preview</Badge>
          </Flex>
          <Button size="2" color="gray" variant="surface" onClick={() => setFullScreen(null)} style={{ cursor: 'pointer', gap: '6px' }}>
            <IconMinimize /> Exit Preview
          </Button>
        </Flex>
        <Flex style={{ flexGrow: 1 }} align="start" justify="center" p="8">
          <Box style={{ width: '100%', maxWidth: canvasViewportWidth, background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--gray-4)', boxShadow: '0 24px 60px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {fullScreenPageData.content
              ? <RenderElement node={fullScreenPageData.content} isWireframe={false} />
              : <Flex p="8" align="center" justify="center"><Text color="gray">No content</Text></Flex>
            }
          </Box>
        </Flex>
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
