import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  Avatar,
  Button,
  Dialog,
  TextField,
  Select,
  Separator,
  Badge,
  
} from '@radix-ui/themes'

import { createOrgInvite, listOrgInvites, reinviteOrgInvite } from '../../services/orgApi'
import { deleteOrgUser, listOrgUsers, updateOrgUser } from '../../services/orgUsersApi'
import { ORG_ROLES, normalizeOrgInvite } from '../../models/orgInvite'
import { normalizeOrgUser } from '../../models/orgUser'
import {
  approveProjectAccessRequest,
  inviteUserToProjectByEmail,
  listProjectAccessRequests,
  listProjectCatalog,
  rejectProjectAccessRequest,
} from '../../services/projectApi'
import { useAuth } from '../../auth/AuthContext'

export function ProjectTeamPage() {
  const { orgId } = useParams()
  const { sessionUser } = useAuth()
  const sessionRole = (sessionUser?.role || '').toLowerCase()
  const isAdmin = sessionRole === 'admin' || sessionRole === 'owner' || sessionRole === 'superadmin'

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError, setMembersError] = useState('')

  const [invites, setInvites] = useState([])
  const [invitesLoading, setInvitesLoading] = useState(true)
  const [invitesError, setInvitesError] = useState('')
  const [showAllInvites, setShowAllInvites] = useState(false)

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteProjectId, setInviteProjectId] = useState('')
  const [inviteProjectRole, setInviteProjectRole] = useState('contributor')
  const [inviteProjectAccess, setInviteProjectAccess] = useState([])
  const [inviteSubmitting, setInviteSubmitting] = useState(false)
  const [inviteSubmitError, setInviteSubmitError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [reinviteSubmittingId, setReinviteSubmittingId] = useState('')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [projectCatalog, setProjectCatalog] = useState([])
  const [accessRequests, setAccessRequests] = useState([])
  const [accessRequestsLoading, setAccessRequestsLoading] = useState(false)
  const [accessRequestsError, setAccessRequestsError] = useState('')
  const [decidingRequestId, setDecidingRequestId] = useState('')

  const [projectInviteDialogOpen, setProjectInviteDialogOpen] = useState(false)
  const [projectInviteTarget, setProjectInviteTarget] = useState('')
  const [projectInviteProjectId, setProjectInviteProjectId] = useState('')
  const [projectInviteRole, setProjectInviteRole] = useState('contributor')
  const [projectInviteSubmitting, setProjectInviteSubmitting] = useState(false)
  const [projectInviteError, setProjectInviteError] = useState('')
  const [projectInviteLink, setProjectInviteLink] = useState('')

  const formattedInvites = useMemo(() => invites.map(normalizeOrgInvite).filter(Boolean), [invites])
  const formattedMembers = useMemo(() => members.map(normalizeOrgUser).filter(Boolean), [members])

  const loadMembers = useCallback(async () => {
    if (!orgId) return
    setMembersLoading(true)
    setMembersError('')
    try {
      const response = await listOrgUsers(orgId)
      setMembers(Array.isArray(response) ? response : [])
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setMembersLoading(false)
    }
  }, [orgId])

  const loadInvites = useCallback(async () => {
    if (!orgId) return
    setInvitesLoading(true)
    setInvitesError('')
    try {
      const response = await listOrgInvites(orgId, { includeExpired: showAllInvites })
      setInvites(Array.isArray(response) ? response : [])
    } catch (err) {
      setInvitesError(err instanceof Error ? err.message : 'Failed to load invites')
    } finally {
      setInvitesLoading(false)
    }
  }, [orgId, showAllInvites])

  useEffect(() => {
    loadMembers()
    loadInvites()
  }, [loadInvites, loadMembers])

  useEffect(() => {
    let mounted = true
    async function loadAdminData() {
      if (!orgId) return
      if (!isAdmin) return
      setAccessRequestsLoading(true)
      setAccessRequestsError('')
      try {
        const [catalog, requests] = await Promise.all([
          listProjectCatalog(orgId),
          listProjectAccessRequests(orgId),
        ])
        if (!mounted) return
        setProjectCatalog(Array.isArray(catalog) ? catalog : [])
        setAccessRequests(Array.isArray(requests) ? requests : [])
      } catch (err) {
        if (!mounted) return
        setAccessRequestsError(err instanceof Error ? err.message : 'Failed to load access requests')
      } finally {
        if (mounted) setAccessRequestsLoading(false)
      }
    }
    loadAdminData()
    return () => {
      mounted = false
    }
  }, [orgId, isAdmin])

  const handleCreateInvite = async () => {
    if (!orgId) return
    const email = inviteEmail.trim()
    if (!email) return

    setInviteSubmitting(true)
    setInviteSubmitError('')
    setInviteLink('')
    setCopied(false)
    try {
      const response = await createOrgInvite(orgId, {
        email,
        role: inviteRole,
        project_access: inviteProjectAccess,
      })
      if (response?.invite) {
        setInvites((prev) => [response.invite, ...prev])
      }
      if (response?.invite_link) {
        setInviteLink(response.invite_link)
      }
      setInviteEmail('')
      setInviteProjectId('')
      setInviteProjectRole('contributor')
      setInviteProjectAccess([])
    } catch (err) {
      setInviteSubmitError(err instanceof Error ? err.message : 'Unable to create invite')
    } finally {
      setInviteSubmitting(false)
    }
  }

  const addInviteProjectAccess = () => {
    if (!inviteProjectId) return
    setInviteProjectAccess((prev) => {
      const next = Array.isArray(prev) ? [...prev] : []
      if (next.some((p) => p.project_id === inviteProjectId)) return next
      next.push({ project_id: inviteProjectId, project_role: inviteProjectRole })
      return next
    })
  }

  const removeInviteProjectAccess = (projectId) => {
    setInviteProjectAccess((prev) => (Array.isArray(prev) ? prev.filter((p) => p.project_id !== projectId) : []))
  }

  const handleReinvite = async (invite) => {
    if (!orgId || !invite?.id) return
    setReinviteSubmittingId(invite.id)
    setInviteSubmitError('')
    setInviteLink('')
    setCopied(false)
    try {
      const response = await reinviteOrgInvite(orgId, invite.id)
      if (response?.invite_link) setInviteLink(response.invite_link)
      await loadInvites()
    } catch (err) {
      setInviteSubmitError(err instanceof Error ? err.message : 'Unable to reinvite')
    } finally {
      setReinviteSubmittingId('')
    }
  }

  const copyInviteLink = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  const formatDate = (value) => {
    if (!value) return ''
    try {
      return new Date(value).toLocaleString()
    } catch {
      return String(value)
    }
  }

  const handleToggleActive = async (member) => {
    if (!orgId || !member?.id) return
    const nextActive = !member.is_active
    try {
      const updated = await updateOrgUser(orgId, member.id, { is_active: nextActive })
      setMembers((prev) => prev.map((u) => (u.id === member.id ? updated : u)))
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : 'Unable to update member')
    }
  }

  const openDeleteDialog = (member) => {
    setDeleteTarget(member)
    setDeleteError('')
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!orgId || !deleteTarget?.id) return
    setDeleteSubmitting(true)
    setDeleteError('')
    try {
      await deleteOrgUser(orgId, deleteTarget.id)
      setMembers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete member')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const handleApproveRequest = async (req) => {
    if (!orgId || !req?.id) return
    setDecidingRequestId(req.id)
    setAccessRequestsError('')
    try {
      await approveProjectAccessRequest(orgId, req.id)
      setAccessRequests((prev) => prev.filter((r) => r.id !== req.id))
    } catch (err) {
      setAccessRequestsError(err instanceof Error ? err.message : 'Unable to approve request')
    } finally {
      setDecidingRequestId('')
    }
  }

  const handleRejectRequest = async (req) => {
    if (!orgId || !req?.id) return
    setDecidingRequestId(req.id)
    setAccessRequestsError('')
    try {
      await rejectProjectAccessRequest(orgId, req.id)
      setAccessRequests((prev) => prev.filter((r) => r.id !== req.id))
    } catch (err) {
      setAccessRequestsError(err instanceof Error ? err.message : 'Unable to reject request')
    } finally {
      setDecidingRequestId('')
    }
  }

  const handleInviteToProject = async () => {
    if (!orgId) return
    if (!projectInviteTarget || !projectInviteProjectId) return

    setProjectInviteSubmitting(true)
    setProjectInviteError('')
    setProjectInviteLink('')
    try {
      const [kind, id] = String(projectInviteTarget).split(':')

      if (kind === 'user') {
        const member = formattedMembers.find((m) => m.id === id)
        const email = member?.email || ''
        if (!email) {
          setProjectInviteError('User not found')
          return
        }
        const response = await inviteUserToProjectByEmail(orgId, projectInviteProjectId, {
          email,
          role: projectInviteRole,
        })

        if (response?.status === 'added') {
          setProjectInviteTarget('')
          setProjectInviteDialogOpen(false)
          await loadInvites()
          return
        }

        if (response?.status === 'needs_org_invite' && response?.invite) {
          const inviteResp = await createOrgInvite(orgId, {
            email: response.invite.email,
            role: response.invite.role || 'viewer',
            project_access: response.invite.project_access || [],
          })
          if (inviteResp?.invite_link) setProjectInviteLink(inviteResp.invite_link)
          await loadInvites()
          return
        }

        setProjectInviteError('Unexpected response')
        return
      }

      if (kind === 'invite') {
        const invite = formattedInvites.find((i) => i.id === id)
        const email = invite?.email || ''
        if (!email) {
          setProjectInviteError('Invite not found')
          return
        }
        const inviteResp = await createOrgInvite(orgId, {
          email,
          role: invite?.role || 'viewer',
          project_access: [{ project_id: projectInviteProjectId, project_role: projectInviteRole }],
        })
        if (inviteResp?.invite_link) setProjectInviteLink(inviteResp.invite_link)
        await loadInvites()
        return
      }

      setProjectInviteError('Select a member or invite')
    } catch (err) {
      setProjectInviteError(err instanceof Error ? err.message : 'Unable to invite')
    } finally {
      setProjectInviteSubmitting(false)
    }
  }

  return (
    <Box p="6">
      <Flex direction="column" gap="4">
        <Heading size="6">Team</Heading>
        <Text size="2" color="gray">
          Invite organization members and assign their org role.
        </Text>

        {isAdmin ? (
          <Card size="2" variant="surface">
            <Flex direction="column" gap="3">
              <Flex align="center" justify="between" gap="3">
                <Heading size="4">Project access requests</Heading>
                <Dialog.Root
                  open={projectInviteDialogOpen}
                  onOpenChange={async (open) => {
                    setProjectInviteDialogOpen(open)
                    if (!open) return
                    if (!orgId || !isAdmin) return
                    if (projectCatalog.length) return
                    try {
                      const catalog = await listProjectCatalog(orgId)
                      setProjectCatalog(Array.isArray(catalog) ? catalog : [])
                    } catch (err) {
                      setProjectInviteError(err instanceof Error ? err.message : 'Failed to load projects')
                    }
                  }}
                >
                  {/* Ensure catalog is loaded even if admin panel hasn't yet */}
                  <Dialog.Trigger>
                    <Button size="2" variant="soft">
                      Invite to project
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content maxWidth="520px">
                    <Dialog.Title>Invite to project</Dialog.Title>
                    <Dialog.Description size="2" mb="3">
                      Add an existing org user to a project, or create an org invite with project access.
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                      <Flex direction="column" gap="1">
                        <Text as="label" size="2" weight="medium">
                          Member / Invite
                        </Text>
                        <Select.Root value={projectInviteTarget} onValueChange={setProjectInviteTarget} size="2">
                          <Select.Trigger variant="surface" style={{ width: '100%' }} />
                          <Select.Content>
                            <Select.Group>
                              <Select.Label>Members</Select.Label>
                              {formattedMembers
                                .filter((m) => m.is_active)
                                .map((m) => (
                                  <Select.Item key={`user-${m.id}`} value={`user:${m.id}`}>
                                    {m.email} ({m.role})
                                  </Select.Item>
                                ))}
                            </Select.Group>
                            <Select.Separator />
                            <Select.Group>
                              <Select.Label>Pending invites</Select.Label>
                              {formattedInvites.map((i) => (
                                <Select.Item key={`invite-${i.id}`} value={`invite:${i.id}`}>
                                  {i.email} (invited as {i.role})
                                </Select.Item>
                              ))}
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      </Flex>

                      <Flex direction="column" gap="1">
                        <Text as="label" size="2" weight="medium">
                          Project
                        </Text>
                        <Select.Root value={projectInviteProjectId} onValueChange={setProjectInviteProjectId} size="2">
                          <Select.Trigger variant="surface" style={{ width: '100%' }} />
                          <Select.Content>
                            {projectCatalog.map((p) => (
                              <Select.Item key={p.id} value={p.id}>
                                {p.name}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </Flex>

                      <Flex direction="column" gap="1">
                        <Text as="label" size="2" weight="medium">
                          Project role
                        </Text>
                        <Select.Root value={projectInviteRole} onValueChange={setProjectInviteRole} size="2">
                          <Select.Trigger variant="surface" style={{ width: '100%' }} />
                          <Select.Content>
                            <Select.Item value="viewer">viewer</Select.Item>
                            <Select.Item value="contributor">contributor</Select.Item>
                            <Select.Item value="project_admin">project_admin</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </Flex>

                      {projectInviteError ? (
                        <Text size="2" color="red">
                          {projectInviteError}
                        </Text>
                      ) : null}

                      {projectInviteLink ? (
                        <Card variant="surface" size="1">
                          <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">
                              Invite link
                            </Text>
                            <Text size="1" color="gray" style={{ wordBreak: 'break-all' }}>
                              {projectInviteLink}
                            </Text>
                          </Flex>
                        </Card>
                      ) : null}

                      <Flex gap="3" mt="2" justify="end">
                        <Button variant="soft" color="gray" onClick={() => setProjectInviteDialogOpen(false)}>
                          Close
                        </Button>
                        <Button
                          onClick={handleInviteToProject}
                          disabled={projectInviteSubmitting || !projectInviteTarget || !projectInviteProjectId}
                        >
                          {projectInviteSubmitting ? 'Inviting...' : 'Invite'}
                        </Button>
                      </Flex>
                    </Flex>
                  </Dialog.Content>
                </Dialog.Root>
              </Flex>

              {accessRequestsLoading ? (
                <Text size="2" color="gray">
                  Loading access requests...
                </Text>
              ) : null}
              {accessRequestsError ? (
                <Text size="2" color="red">
                  {accessRequestsError}
                </Text>
              ) : null}
              {!accessRequestsLoading && !accessRequestsError && accessRequests.length === 0 ? (
                <Text size="2" color="gray">
                  No pending requests. (A request shows up after a viewer clicks “Request access” from Projects.)
                </Text>
              ) : null}

              <Flex direction="column" gap="2">
                {accessRequests.map((req) => (
                  <Flex key={req.id} align="center" justify="between" gap="3">
                    <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                      <Text size="2" weight="medium" trim="end">
                        {req.user_email}
                      </Text>
                      <Text size="1" color="gray">
                        Project: {req.project_name || req.project_id}
                      </Text>
                    </Flex>
                    <Flex gap="2">
                      <Button
                        size="1"
                        onClick={() => handleApproveRequest(req)}
                        disabled={decidingRequestId === req.id}
                      >
                        {decidingRequestId === req.id ? 'Working...' : 'Approve'}
                      </Button>
                      <Button
                        size="1"
                        variant="soft"
                        color="gray"
                        onClick={() => handleRejectRequest(req)}
                        disabled={decidingRequestId === req.id}
                      >
                        Reject
                      </Button>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Card>
        ) : null}

        <Card size="2" variant="surface">
          <Flex direction="column" gap="3">
            <Heading size="4">Members</Heading>
            {membersLoading ? (
              <Text size="2" color="gray">
                Loading members...
              </Text>
            ) : null}
            {membersError ? (
              <Text size="2" color="red">
                {membersError}
              </Text>
            ) : null}

            {!membersLoading && !membersError && formattedMembers.length === 0 ? (
              <Text size="2" color="gray">
                No members found.
              </Text>
            ) : null}

            {formattedMembers.map((member) => (
              <Flex key={member.id} align="center" justify="between" gap="3">
                <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                  <Avatar size="2" radius="full" fallback={(member.email || '?').slice(0, 2).toUpperCase()} />
                  <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                    <Flex align="center" gap="2" wrap="wrap">
                      <Text size="2" weight="medium" trim="end">
                        {member.email}
                      </Text>
                      {member.is_active ? (
                        <Badge size="1" color="green" variant="soft">
                          Active
                        </Badge>
                      ) : (
                        <Badge size="1" color="gray" variant="soft">
                          Deactivated
                        </Badge>
                      )}
                    </Flex>
                    <Text size="1" color="gray">
                      {member.role}
                      {member.last_login_at ? ` • last login ${formatDate(member.last_login_at)}` : ''}
                    </Text>
                  </Flex>
                </Flex>

                <Flex gap="2" align="center">
                  <Button size="1" variant="soft" onClick={() => handleToggleActive(member)}>
                    {member.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="1" color="red" variant="soft" onClick={() => openDeleteDialog(member)}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            ))}

            <Separator size="4" />

            <Flex align="center" justify="between">
              <Heading size="4">{showAllInvites ? 'Invites' : 'Pending invites'}</Heading>
              <Flex gap="2" align="center">
                <Button
                  size="1"
                  variant="soft"
                  color="gray"
                  onClick={() => setShowAllInvites((v) => !v)}
                  disabled={invitesLoading}
                >
                  {showAllInvites ? 'Show pending' : 'Show all'}
                </Button>
                <Dialog.Root open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <Dialog.Trigger>
                    <Button size="2">Invite member</Button>
                  </Dialog.Trigger>
                <Dialog.Content maxWidth="520px">
                  <Dialog.Title>Invite member</Dialog.Title>
                  <Dialog.Description size="2" mb="3">
                    Create an invite link and send it via email.
                  </Dialog.Description>

                  <Flex direction="column" gap="3">
                    <Flex direction="column" gap="1">
                      <Text as="label" size="2" weight="medium">
                        Email
                      </Text>
                      <TextField.Root
                        placeholder="user@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateInvite()
                        }}
                      />
                    </Flex>

                    <Flex direction="column" gap="1">
                      <Text as="label" size="2" weight="medium">
                        Role
                      </Text>
                      <Select.Root value={inviteRole} onValueChange={setInviteRole} size="2">
                        <Select.Trigger variant="surface" style={{ width: '100%' }} />
                        <Select.Content>
                          {ORG_ROLES.map((role) => (
                            <Select.Item key={role} value={role}>
                              {role}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Flex>

                    {projectCatalog.length ? (
                      <Card variant="surface" size="1">
                        <Flex direction="column" gap="3">
                          <Text size="2" weight="medium">
                            Project onboarding (optional)
                          </Text>

                          <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">
                              Project
                            </Text>
                            <Select.Root value={inviteProjectId} onValueChange={setInviteProjectId} size="2">
                              <Select.Trigger variant="surface" style={{ width: '100%' }} />
                              <Select.Content>
                                {projectCatalog.map((p) => (
                                  <Select.Item key={p.id} value={p.id}>
                                    {p.name}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          </Flex>

                          <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">
                              Project role
                            </Text>
                            <Select.Root value={inviteProjectRole} onValueChange={setInviteProjectRole} size="2">
                              <Select.Trigger variant="surface" style={{ width: '100%' }} />
                              <Select.Content>
                                <Select.Item value="viewer">viewer</Select.Item>
                                <Select.Item value="contributor">contributor</Select.Item>
                                <Select.Item value="project_admin">project_admin</Select.Item>
                              </Select.Content>
                            </Select.Root>
                          </Flex>

                          <Flex justify="end">
                            <Button size="1" variant="soft" onClick={addInviteProjectAccess} disabled={!inviteProjectId}>
                              Add project
                            </Button>
                          </Flex>

                          {inviteProjectAccess.length ? (
                            <Flex direction="column" gap="2">
                              {inviteProjectAccess.map((entry) => {
                                const name =
                                  projectCatalog.find((p) => p.id === entry.project_id)?.name || entry.project_id
                                return (
                                  <Flex key={entry.project_id} align="center" justify="between" gap="3">
                                    <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                                      <Text size="2" weight="medium" trim="end">
                                        {name}
                                      </Text>
                                      <Text size="1" color="gray">
                                        {entry.project_role}
                                      </Text>
                                    </Flex>
                                    <Button
                                      size="1"
                                      variant="soft"
                                      color="gray"
                                      onClick={() => removeInviteProjectAccess(entry.project_id)}
                                    >
                                      Remove
                                    </Button>
                                  </Flex>
                                )
                              })}
                            </Flex>
                          ) : (
                            <Text size="1" color="gray">
                              Add projects now to onboard the user after they accept the email invite.
                            </Text>
                          )}
                        </Flex>
                      </Card>
                    ) : null}

                    {inviteSubmitError ? (
                      <Text size="2" color="red">
                        {inviteSubmitError}
                      </Text>
                    ) : null}

                    {inviteLink ? (
                      <Card variant="surface" size="1">
                        <Flex direction="column" gap="2">
                          <Text size="2" weight="medium">
                            Invite link
                          </Text>
                          <Text size="1" color="gray" style={{ wordBreak: 'break-all' }}>
                            {inviteLink}
                          </Text>
                          <Flex gap="2">
                            <Button size="1" variant="soft" onClick={copyInviteLink}>
                              {copied ? 'Copied' : 'Copy link'}
                            </Button>
                          </Flex>
                        </Flex>
                      </Card>
                    ) : null}

                    <Flex gap="3" mt="2" justify="end">
                      <Button variant="soft" color="gray" onClick={() => setInviteDialogOpen(false)}>
                        Close
                      </Button>
                      <Button onClick={handleCreateInvite} disabled={inviteSubmitting || !inviteEmail.trim()}>
                        {inviteSubmitting ? 'Inviting...' : 'Create invite'}
                      </Button>
                    </Flex>
                  </Flex>
                </Dialog.Content>
                </Dialog.Root>
              </Flex>
            </Flex>

            {invitesLoading ? (
              <Text size="2" color="gray">
                Loading invites...
              </Text>
            ) : null}
            {invitesError ? (
              <Text size="2" color="red">
                {invitesError}
              </Text>
            ) : null}
            {!invitesLoading && !invitesError && formattedInvites.length === 0 ? (
              <Text size="2" color="gray">
                {showAllInvites ? 'No invites.' : 'No pending invites.'}
              </Text>
            ) : null}

            {inviteLink ? (
              <Card variant="surface" size="1">
                <Flex direction="column" gap="2">
                  <Text size="2" weight="medium">
                    Latest invite link
                  </Text>
                  <Text size="1" color="gray" style={{ wordBreak: 'break-all' }}>
                    {inviteLink}
                  </Text>
                  <Flex gap="2">
                    <Button size="1" variant="soft" onClick={copyInviteLink}>
                      {copied ? 'Copied' : 'Copy link'}
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ) : null}

            <Flex direction="column" gap="2">
              {formattedInvites.map((invite) => (
                <Flex key={invite.id} align="center" justify="between" gap="3">
                  <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                    <Text size="2" weight="medium" trim="end">
                      {invite.email}
                    </Text>
                    <Text size="1" color="gray">
                      {invite.role} • {invite.status} • expires {formatDate(invite.expires_at)}
                    </Text>
                  </Flex>
                  <Flex gap="2" align="center">
                    <Button
                      size="1"
                      variant="soft"
                      onClick={() => handleReinvite(invite)}
                      disabled={reinviteSubmittingId === invite.id}
                    >
                      {reinviteSubmittingId === invite.id ? 'Reinviting...' : 'Reinvite'}
                    </Button>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Card>
      </Flex>

      <Dialog.Root
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError('')
          }
          setDeleteDialogOpen(open)
        }}
      >
        <Dialog.Content maxWidth="520px">
          <Dialog.Title>Delete member</Dialog.Title>
          <Dialog.Description size="2" mb="3">
            {deleteTarget?.email ? `Delete ${deleteTarget.email} from this organization?` : 'Delete this member?'}
          </Dialog.Description>

          {deleteError ? (
            <Text size="2" color="red">
              {deleteError}
            </Text>
          ) : null}

          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={() => setDeleteDialogOpen(false)} disabled={deleteSubmitting}>
              Cancel
            </Button>
            <Button color="red" onClick={handleConfirmDelete} disabled={deleteSubmitting}>
              {deleteSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
