import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Box, Text } from '@radix-ui/themes'

const PK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const COLUMN_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v18M3 12h18" />
  </svg>
)

const UNIQUE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
    <path d="M8 12h8M12 8v8" />
  </svg>
)

function SchemaTableNode({ data }) {
  const { tableName, columns } = data

  return (
    <Box
      style={{
        minWidth: 200,
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--gray-2)',
        border: '1px solid var(--gray-6)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Box
        style={{
          padding: '8px 12px',
          background: 'var(--teal-9)',
          color: 'var(--teal-1)',
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {tableName}
      </Box>
      <Box style={{ padding: '4px 0' }}>
        {columns.map((col) => (
          <Box
            key={col.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              color: 'var(--gray-12)',
            }}
          >
            <Handle type="target" position={Position.Left} id={`${col.name}-in`} style={{ left: 0 }} />
            <span style={{ flexShrink: 0, color: 'var(--gray-10)', display: 'flex' }}>
              {col.primaryKey ? PK_ICON : col.unique ? UNIQUE_ICON : COLUMN_ICON}
            </span>
            <Text size="1" style={{ flex: 1, fontWeight: col.primaryKey ? 600 : 400 }}>
              {col.primaryKey ? `# ${col.name}` : col.name}
            </Text>
            <Text size="1" color="gray">{col.type}</Text>
            {col.primaryKey && <Handle type="source" position={Position.Right} id={`${col.name}-out`} style={{ right: 0 }} />}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default memo(SchemaTableNode)
