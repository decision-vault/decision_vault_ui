export function normalizeOrgUser(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider || '',
    is_active: user.is_active !== false,
    created_at: user.created_at || null,
    last_login_at: user.last_login_at || null,
  }
}

