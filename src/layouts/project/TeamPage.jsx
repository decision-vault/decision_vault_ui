import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Table,
  Badge,
  Dialog,
  Select,
  Spinner,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { UserPlus, UserMinus } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/Toast";
import { listProjects } from "../../services/projectApi";
import {
  createProjectInvite,
  leaveProject,
  listProjectInvites,
  listProjectMembers,
  removeProjectMember,
  revokeProjectInvite,
  updateProjectMemberRole,
} from "../../services/projectTeamApi";

const ROLE_OPTIONS = [
  { value: "viewer", label: "Viewer" },
  { value: "contributor", label: "Contributor" },
  { value: "project_admin", label: "Project admin" },
];

function roleLabel(role) {
  const found = ROLE_OPTIONS.find((o) => o.value === role);
  return found ? found.label : role;
}

export default function TeamPage() {
  const { orgId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sessionUser } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(searchParams.get("project") || "");

  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("contributor");
  const [isSending, setIsSending] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    listProjects(orgId)
      .then((data) => {
        if (cancelled) return;
        const list = data || [];
        setProjects(list);
        if (!list.length) {
          setIsLoading(false);
          return;
        }
        const selected = list.some((p) => p.id === projectId) ? projectId : list[0].id;
        setProjectId(selected);
        setSearchParams((prev) => ({ ...Object.fromEntries(prev), project: selected }), { replace: true });
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error("Failed to load projects", err instanceof Error ? err.message : undefined);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const loadTeam = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [memberData, inviteData] = await Promise.all([
        listProjectMembers(orgId, projectId),
        listProjectInvites(orgId, projectId),
      ]);
      setMembers(memberData || []);
      setInvites(inviteData || []);
    } catch (err) {
      toast.error("Failed to load team", err instanceof Error ? err.message : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, projectId]);

  useEffect(() => {
    if (orgId && projectId) loadTeam();
  }, [orgId, projectId, loadTeam]);

  const selfEmail = (sessionUser?.email || "").toLowerCase();
  const self = members.find((m) => (m.email || "").toLowerCase() === selfEmail);
  const currentRole = self?.role || "viewer";
  const canManage = currentRole === "project_admin";

  const filteredMembers = members.filter((member) =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectChange = (nextProjectId) => {
    setProjectId(nextProjectId);
    setSearchParams((prev) => ({ ...Object.fromEntries(prev), project: nextProjectId }), { replace: true });
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !canManage) return;
    setIsSending(true);
    try {
      await createProjectInvite(orgId, projectId, { email: inviteEmail, role: inviteRole });
      toast.success("Invitation sent", `${inviteEmail} has been invited as ${roleLabel(inviteRole)}.`);
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("contributor");
      loadTeam();
    } catch (err) {
      toast.error("Failed to send invitation", err instanceof Error ? err.message : undefined);
    } finally {
      setIsSending(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setBusyId(userId);
    try {
      await updateProjectMemberRole(orgId, projectId, userId, role);
      setMembers((prev) => prev.map((m) => (m.user_id === userId ? { ...m, role } : m)));
      toast.success("Role updated", `${roleLabel(role)}`);
    } catch (err) {
      toast.error("Failed to update role", err instanceof Error ? err.message : undefined);
    } finally {
      setBusyId("");
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    setBusyId(userId);
    try {
      await removeProjectMember(orgId, projectId, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      toast.success("Member removed", "They no longer have access to this project.");
    } catch (err) {
      toast.error("Failed to remove member", err instanceof Error ? err.message : undefined);
    } finally {
      setBusyId("");
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Leave this project?")) return;
    setBusyId("self");
    try {
      await leaveProject(orgId, projectId);
      setMembers((prev) => prev.filter((m) => (m.email || "").toLowerCase() !== selfEmail));
      toast.success("Left project", "You are no longer a member of this project.");
    } catch (err) {
      toast.error("Failed to leave project", err instanceof Error ? err.message : undefined);
    } finally {
      setBusyId("");
    }
  };

  const handleRevoke = async (inviteId) => {
    setBusyId(inviteId);
    try {
      await revokeProjectInvite(orgId, projectId, inviteId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success("Invitation revoked", "The pending invitation is no longer valid.");
    } catch (err) {
      toast.error("Failed to revoke invitation", err instanceof Error ? err.message : undefined);
    } finally {
      setBusyId("");
    }
  };

  if (!orgId) {
    return <Spinner />;
  }

  if (!isLoading && !projects.length) {
    return (
      <Box style={{ width: "100%" }}>
        <Heading size="6" weight="bold" mb="4" style={{ color: "var(--gray-12)" }}>
          Team
        </Heading>
        <Box
          style={{
            border: "1px dashed var(--gray-5)",
            borderRadius: "8px",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <Text as="div" size="3" weight="medium" mb="2" style={{ color: "var(--gray-12)" }}>
            No projects yet
          </Text>
          <Text as="div" size="2" color="gray" mb="4">
            Create a project to start managing its team.
          </Text>
          <Link to={`/organizations/${orgId}/new`}>
            <Button variant="solid" size="2" style={{ fontWeight: "600", cursor: "pointer" }}>
              New project
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" p="8" style={{ minHeight: 300 }}>
        <Spinner size="3" />
      </Flex>
    );
  }

  return (
    <Box style={{ width: "100%" }}>
      <Flex justify="between" align="center" mb="5" gap="3" wrap="wrap">
        <Box>
          <Heading size="6" weight="bold" style={{ color: "var(--gray-12)" }}>
            Team
          </Heading>
          <Text size="2" color="gray">
            Manage who can access this project and their roles.
          </Text>
        </Box>
        <Flex align="center" gap="2">
          <Select.Root value={projectId} onValueChange={handleProjectChange}>
            <Select.Trigger placeholder="Select project" style={{ minWidth: 200 }} />
            <Select.Content>
              {projects.map((p) => (
                <Select.Item key={p.id} value={p.id}>
                  {p.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {canManage && (
            <Dialog.Root open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <Dialog.Trigger>
                <Button variant="solid" size="2" style={{ fontWeight: "600", cursor: "pointer" }}>
                  <UserPlus size={16} />
                  Invite members
                </Button>
              </Dialog.Trigger>
              <Dialog.Content size="2" style={{ maxWidth: 460, borderRadius: "12px" }}>
                <Dialog.Title>Invite Team Members</Dialog.Title>
                <Dialog.Description size="2" color="gray" mb="4">
                  Invite someone to collaborate on this project. They'll join when they accept.
                </Dialog.Description>
                <form onSubmit={handleSendInvite}>
                  <Flex direction="column" gap="4">
                    <Box>
                      <Text as="div" size="2" weight="medium" mb="1">
                        Email Address
                      </Text>
                      <TextField.Root
                        type="email"
                        required
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        size="2"
                      />
                    </Box>
                    <Box>
                      <Text as="div" size="2" weight="medium" mb="1">
                        Role Assignment
                      </Text>
                      <Select.Root value={inviteRole} onValueChange={setInviteRole}>
                        <Select.Trigger style={{ width: "100%" }} />
                        <Select.Content>
                          {ROLE_OPTIONS.map((o) => (
                            <Select.Item key={o.value} value={o.value}>
                              {o.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                    <Flex gap="3" mt="2" justify="end">
                      <Dialog.Close>
                        <Button type="button" variant="soft" color="gray">
                          Cancel
                        </Button>
                      </Dialog.Close>
                      <Button type="submit" variant="solid" disabled={isSending} style={{ fontWeight: "600", cursor: "pointer" }}>
                        {isSending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </Flex>
                  </Flex>
                </form>
              </Dialog.Content>
            </Dialog.Root>
          )}
        </Flex>
      </Flex>

      <Flex justify="between" align="center" mb="4">
        <Box style={{ width: 280 }}>
          <TextField.Root
            placeholder="Filter members"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="2"
            radius="md"
            style={{ backgroundColor: "var(--gray-2)" }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" color="var(--gray-9)" />
            </TextField.Slot>
          </TextField.Root>
        </Box>
      </Flex>

      <Box
        style={{
          border: "1px solid var(--gray-4)",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "var(--color-panel-solid)",
        }}
      >
        <Table.Root variant="ghost" style={{ width: "100%" }}>
          <Table.Header style={{ backgroundColor: "var(--gray-2)" }}>
            <Table.Row>
              <Table.ColumnHeaderCell
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.05em",
                  color: "var(--gray-10)",
                  padding: "12px 16px",
                }}
              >
                MEMBER
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.05em",
                  color: "var(--gray-10)",
                  padding: "12px 16px",
                }}
              >
                ROLE
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="140px" />
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {filteredMembers.map((member) => {
              const isSelf = (member.email || "").toLowerCase() === selfEmail;
              const isOwner = member.is_owner;
              return (
                <Table.Row key={member.user_id} style={{ alignItems: "center" }}>
                  <Table.RowHeaderCell style={{ padding: "16px", verticalAlign: "middle" }}>
                    <Flex align="center" gap="3">
                      <Box
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          border: "1px solid var(--gray-5)",
                          backgroundColor: "var(--gray-1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--gray-9)",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        {(member.email || "?").slice(0, 2).toUpperCase()}
                      </Box>
                      <Flex align="center" gap="2" wrap="wrap">
                        <Text size="2" weight="medium" style={{ color: "var(--gray-12)" }}>
                          {member.email}
                        </Text>
                        {isOwner && (
                          <Badge color="blue" variant="soft" radius="full" style={{ fontSize: "10px", padding: "0 6px" }}>
                            Owner
                          </Badge>
                        )}
                        {isSelf && (
                          <Badge color="gray" variant="soft" radius="full" style={{ fontSize: "10px", padding: "0 6px" }}>
                            You
                          </Badge>
                        )}
                      </Flex>
                    </Flex>
                  </Table.RowHeaderCell>

                  <Table.Cell style={{ padding: "16px", verticalAlign: "middle" }}>
                    {isOwner || !canManage || isSelf ? (
                      <Text size="2" style={{ color: "var(--gray-12)" }}>
                        {roleLabel(member.role)}
                      </Text>
                    ) : (
                      <Select.Root
                        value={member.role}
                        disabled={busyId === member.user_id}
                        onValueChange={(role) => handleRoleChange(member.user_id, role)}
                      >
                        <Select.Trigger style={{ width: 150 }} />
                        <Select.Content>
                          {ROLE_OPTIONS.map((o) => (
                            <Select.Item key={o.value} value={o.value}>
                              {o.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    )}
                  </Table.Cell>

                  <Table.Cell style={{ padding: "16px", verticalAlign: "middle" }}>
                    <Flex justify="end" align="center" gap="2">
                      {isSelf && !isOwner ? (
                        <Button
                          variant="outline"
                          color="gray"
                          size="1"
                          disabled={busyId === "self"}
                          onClick={handleLeave}
                          style={{ cursor: "pointer" }}
                        >
                          Leave team
                        </Button>
                      ) : canManage && !isOwner ? (
                        <Button
                          variant="ghost"
                          color="red"
                          size="1"
                          disabled={busyId === member.user_id}
                          onClick={() => handleRemove(member.user_id)}
                          style={{ cursor: "pointer" }}
                        >
                          <UserMinus size={14} />
                          Remove
                        </Button>
                      ) : null}
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              );
            })}
            {filteredMembers.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={3} style={{ padding: "24px", textAlign: "center" }}>
                  <Text size="2" color="gray">
                    No members found.
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        <Box px="4" py="3" style={{ backgroundColor: "var(--gray-1)" }}>
          <Text size="2" style={{ color: "var(--gray-10)" }}>
            {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"}
          </Text>
        </Box>
      </Box>

      {canManage && invites.length > 0 && (
        <Box mt="6">
          <Heading size="4" weight="bold" mb="3" style={{ color: "var(--gray-12)" }}>
            Pending invitations
          </Heading>
          <Box
            style={{
              border: "1px solid var(--gray-4)",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "var(--color-panel-solid)",
            }}
          >
            <Table.Root variant="ghost" style={{ width: "100%" }}>
              <Table.Header style={{ backgroundColor: "var(--gray-2)" }}>
                <Table.Row>
                  <Table.ColumnHeaderCell style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.05em", color: "var(--gray-10)", padding: "12px 16px" }}>
                    EMAIL
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.05em", color: "var(--gray-10)", padding: "12px 16px" }}>
                    ROLE
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.05em", color: "var(--gray-10)", padding: "12px 16px" }}>
                    STATUS
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width="100px" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {invites.map((invite) => (
                  <Table.Row key={invite.id}>
                    <Table.RowHeaderCell style={{ padding: "12px 16px" }}>
                      <Text size="2" style={{ color: "var(--gray-12)" }}>
                        {invite.email}
                      </Text>
                    </Table.RowHeaderCell>
                    <Table.Cell style={{ padding: "12px 16px" }}>
                      <Text size="2">{roleLabel(invite.role)}</Text>
                    </Table.Cell>
                    <Table.Cell style={{ padding: "12px 16px" }}>
                      <Badge color="orange" variant="soft" size="1">
                        Pending
                      </Badge>
                    </Table.Cell>
                    <Table.Cell style={{ padding: "12px 16px" }}>
                      <Flex justify="end">
                        <Button
                          variant="ghost"
                          color="gray"
                          size="1"
                          disabled={busyId === invite.id}
                          onClick={() => handleRevoke(invite.id)}
                          style={{ cursor: "pointer" }}
                        >
                          Revoke
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      )}
    </Box>
  );
}
