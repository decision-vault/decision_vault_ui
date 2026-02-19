// Database schema flow: tables as nodes, FK relationships as edges.
// Matches Startup Analytics Dashboard from System Design.

export const TABLE_NODE_TYPE = 'schemaTable'

function tableNode(id, tableName, columns, x, y) {
  return {
    id,
    type: TABLE_NODE_TYPE,
    position: { x, y },
    data: { tableName, columns },
  }
}

function column(name, type, opts = {}) {
  return { name, type, primaryKey: !!opts.primaryKey, unique: !!opts.unique }
}

export const INITIAL_TABLES = [
  {
    id: 'tenant',
    tableName: 'tenant',
    columns: [
      column('id', 'uuid', { primaryKey: true }),
      column('name', 'text'),
      column('created_at', 'timestamptz'),
    ],
    x: 100,
    y: 80,
  },
  {
    id: 'users',
    tableName: 'users',
    columns: [
      column('id', 'uuid', { primaryKey: true }),
      column('tenant_id', 'uuid'),
      column('email', 'text'),
      column('password_hash', 'text'),
      column('role', 'admin | member'),
      column('created_at', 'timestamptz'),
    ],
    x: 420,
    y: 80,
  },
  {
    id: 'metric',
    tableName: 'metric',
    columns: [
      column('id', 'uuid', { primaryKey: true }),
      column('tenant_id', 'uuid'),
      column('name', 'text'),
      column('category', 'text'),
      column('value', 'numeric'),
      column('recorded_at', 'timestamptz'),
    ],
    x: 420,
    y: 320,
  },
  {
    id: 'dashboard',
    tableName: 'dashboard',
    columns: [
      column('id', 'uuid', { primaryKey: true }),
      column('tenant_id', 'uuid'),
      column('name', 'text'),
      column('configuration_json', 'jsonb'),
    ],
    x: 100,
    y: 320,
  },
  {
    id: 'session',
    tableName: 'session',
    columns: [
      column('id', 'uuid', { primaryKey: true }),
      column('user_id', 'uuid'),
      column('issued_at', 'timestamptz'),
      column('expires_at', 'timestamptz'),
    ],
    x: 740,
    y: 200,
  },
]

export function buildInitialNodes() {
  return INITIAL_TABLES.map((t) =>
    tableNode(t.id, t.tableName, t.columns, t.x, t.y)
  )
}

export function buildInitialEdges() {
  return [
    { id: 'e-tenant-users', source: 'tenant', target: 'users', sourceHandle: 'id-out', targetHandle: 'tenant_id-in', style: { strokeDasharray: '5 5' } },
    { id: 'e-tenant-metric', source: 'tenant', target: 'metric', sourceHandle: 'id-out', targetHandle: 'tenant_id-in', style: { strokeDasharray: '5 5' } },
    { id: 'e-tenant-dashboard', source: 'tenant', target: 'dashboard', sourceHandle: 'id-out', targetHandle: 'tenant_id-in', style: { strokeDasharray: '5 5' } },
    { id: 'e-users-session', source: 'users', target: 'session', sourceHandle: 'id-out', targetHandle: 'user_id-in', style: { strokeDasharray: '5 5' } },
  ]
}
