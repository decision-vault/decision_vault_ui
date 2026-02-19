// Sequence diagram flow: participants as nodes, messages as edges with labels.
// Request flows for Startup Analytics Dashboard (e.g. auth login).

export const PARTICIPANT_NODE_TYPE = 'sequenceParticipant'

function participantNode(id, name, x, y) {
  return {
    id,
    type: PARTICIPANT_NODE_TYPE,
    position: { x, y },
    data: { name },
  }
}

export const INITIAL_PARTICIPANTS = [
  { id: 'browser', name: 'Browser', x: 80, y: 100 },
  { id: 'api', name: 'FastAPI', x: 320, y: 100 },
  { id: 'db', name: 'PostgreSQL', x: 560, y: 100 },
]

export function buildInitialNodes() {
  return INITIAL_PARTICIPANTS.map((p) =>
    participantNode(p.id, p.name, p.x, p.y)
  )
}

export function buildInitialEdges() {
  return [
    { id: 'e1', source: 'browser', target: 'api', label: 'POST /auth/login', data: { label: 'POST /auth/login' } },
    { id: 'e2', source: 'api', target: 'db', label: 'SELECT user', data: { label: 'SELECT user' } },
    { id: 'e3', source: 'db', target: 'api', label: 'user row', data: { label: 'user row' } },
    { id: 'e4', source: 'api', target: 'browser', label: '200 JWT', data: { label: '200 JWT' } },
  ]
}
