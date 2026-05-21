export const ORG_ROLES = ['viewer', 'member', 'admin', 'owner']

export function normalizeOrgInvite(invite) {
  if (!invite) return null
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status || 'pending',
    created_at: invite.created_at,
    expires_at: invite.expires_at,
    accepted_at: invite.accepted_at || null,
    revoked_at: invite.revoked_at || null,
  }
}

