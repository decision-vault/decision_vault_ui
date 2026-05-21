export type RunStatus =
  | 'draft'
  | 'queued'
  | 'running'
  | 'paused'
  | 'clarification_required'
  | 'completed'
  | 'failed'
  | 'stopped'
  | ''

export function statusTone(status: RunStatus): 'emerald' | 'sky' | 'amber' | 'rose' | 'zinc' {
  if (status === 'completed') return 'emerald'
  if (status === 'running' || status === 'queued') return 'sky'
  if (status === 'paused' || status === 'clarification_required') return 'amber'
  if (status === 'failed') return 'rose'
  return 'zinc'
}

export function toTitleCase(input: string) {
  return String(input || '')
    .replaceAll('_', ' ')
    .replaceAll('.', ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

export function shortId(id?: string | null, len = 6) {
  const value = String(id || '')
  if (!value) return ''
  return value.length <= len ? value : value.slice(-len)
}

export function nowIso() {
  return new Date().toISOString()
}

