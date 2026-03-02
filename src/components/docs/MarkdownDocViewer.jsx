import { Box } from '@radix-ui/themes'
import ReactMarkdown from 'react-markdown'
import logo from '../../assets/logo.svg'

export function MarkdownDocViewer({ markdown, maxWidth = 760 }) {
  return (
    <Box className="md-doc-viewer" style={{ maxWidth, margin: '0 auto', position: 'relative' }}>
      <Box
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--gray-6)',
          paddingBottom: 8,
          marginBottom: 12,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent:"center"}}>
          <img src={logo} alt="DecisionVault" style={{ width: 28, height: 28 }} />
          <span style={{ fontSize: 18, lineHeight: 1.1, color: 'var(--gray-12)', fontWeight: 700 }}>DecisionVault</span>
        </Box>
        <span style={{ fontSize: 14, color: 'var(--gray-10)' }}>Product Requirements Document</span>
      </Box>
      <Box style={{ position: 'relative', zIndex: 1 }}>
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 12 }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 24, marginBottom: 8 }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 16, marginBottom: 6 }}>{children}</h3>,
            p: ({ children }) => <p style={{ marginBottom: 12, lineHeight: 1.6 }}>{children}</p>,
            ul: ({ children }) => <ul style={{ marginBottom: 12, paddingLeft: 24 }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ marginBottom: 12, paddingLeft: 24 }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
            table: ({ children }) => (
              <div style={{ overflow: 'auto', marginBottom: 16 }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th style={{ border: '1px solid var(--gray-7)', padding: '8px 12px', textAlign: 'left', background: 'var(--gray-3)' }}>
                {children}
              </th>
            ),
            td: ({ children }) => <td style={{ border: '1px solid var(--gray-6)', padding: '8px 12px' }}>{children}</td>,
            strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
            hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--gray-6)', margin: '24px 0' }} />,
          }}
        >
          {markdown || ''}
        </ReactMarkdown>
      </Box>
      <Box
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--gray-6)',
          marginTop: 20,
          paddingTop: 8,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <img src={logo} alt="DecisionVault" style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 11, color: 'var(--gray-10)' }}>DecisionVault</span>
        </Box>
        <span style={{ fontSize: 11, color: 'var(--gray-10)' }}>Confidential</span>
      </Box>
    </Box>
  )
}
