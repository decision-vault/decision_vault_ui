import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Box, Text } from '@radix-ui/themes'

function SequenceParticipantNode({ data }) {
  const { name } = data

  return (
    <Box
      style={{
        minWidth: 120,
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--color-panel)',
        border: '1px solid var(--gray-6)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ left: 0 }} />
      <Box
        style={{
          padding: '10px 16px',
          background: 'var(--indigo-9)',
          color: 'white',
          fontWeight: 600,
          fontSize: 13,
          textAlign: 'center',
        }}
      >
        {name}
      </Box>
      <Box style={{ height: 24, margin: '0 auto', width: 2, background: 'var(--gray-6)' }} />
      <Handle type="source" position={Position.Right} style={{ right: 0 }} />
    </Box>
  )
}

export default memo(SequenceParticipantNode)
