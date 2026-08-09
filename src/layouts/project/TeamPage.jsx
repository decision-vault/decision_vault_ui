import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Table,
  Badge,
  IconButton,
  Dialog,
  Select,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  ReaderIcon,
  Cross2Icon,
  DotsVerticalIcon,
} from "@radix-ui/react-icons";
import { UserPlus } from "lucide-react";

//  FIXED: Changed to default export named TeamsPage to align perfectly with routes.jsx
export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  // Form management states for the modal
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Developer");

  // Mock initial state aligning with screenshot architecture
  const [members, setMembers] = useState([
    {
      id: "1",
      email: "kaviyarasumaran@gmail.com",
      isYou: true,
      status: null, // Active
      mfa: "Disabled",
      role: "Owner",
    },
    {
      id: "2",
      email: "kavi@gmail.com",
      isYou: false,
      status: "INVITED",
      mfa: "Disabled",
      role: "Developer",
    },
  ]);

  const filteredMembers = members.filter((member) =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        email: inviteEmail,
        isYou: false,
        status: "INVITED",
        mfa: "Disabled",
        role: inviteRole,
      },
    ]);

    // Reset Form Context
    setInviteEmail("");
    setInviteRole("Developer");
    setIsInviteOpen(false);
  };

  return (
    <Box style={{ width: "100%" }}>
      {/* ================= SECTION TITLE ================= */}
      <Heading size="6" weight="bold" mb="5" style={{ color: "var(--gray-12)" }}>
        Team
      </Heading>

      {/* ================= CONTROLS ACTION TOOLBAR ================= */}
      <Flex justify="between" align="center" mb="4" gap="3">
        {/* Search Control Box */}
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

        {/* Action Triggers */}
        <Flex align="center" gap="2">
          <Button variant="outline" color="gray" size="2" radius="md">
            <ReaderIcon />
            Docs
          </Button>

          {/* Radix Managed Dialog Trigger Wrap */}
          <Dialog.Root open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <Dialog.Trigger>
              <Button
              
                variant="solid"
                size="2"
                radius="md"
                style={{ fontWeight: "600", cursor: "pointer" }}
              >
                <UserPlus size={16} />
                Invite members
              </Button>
            </Dialog.Trigger>

            {/* ================= INVITE MODAL INTERFACE ================= */}
            <Dialog.Content size="2" style={{ maxWidth: 460, borderRadius: "12px" }}>
              <Flex justify="between" align="center" mb="4">
                <Dialog.Title style={{ margin: 0 }}>Invite Team Members</Dialog.Title>
                <Dialog.Close>
                  <IconButton variant="ghost" color="gray">
                    <Cross2Icon width="16" height="16" />
                  </IconButton>
                </Dialog.Close>
              </Flex>
              
              <Dialog.Description size="2" color="gray" mb="4">
                Add colleagues to your workspace to collaborate on deployments and LLM configurations.
              </Dialog.Description>

              <form onSubmit={handleSendInvite}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="div" size="2" weight="medium" mb="1" style={{ color: "var(--gray-11)" }}>
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
                    <Text as="div" size="2" weight="medium" mb="1" style={{ color: "var(--gray-11)" }}>
                      Role Assignment
                    </Text>
                    <Select.Root value={inviteRole} onValueChange={setInviteRole}>
                      <Select.Trigger style={{ width: "100%" }} />
                      <Select.Content>
                        <Select.Item value="Owner">Owner</Select.Item>
                        <Select.Item value="Developer">Developer</Select.Item>
                        <Select.Item value="Viewer">Viewer</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Flex gap="3" mt="2" justify="end">
                    <Dialog.Close>
                      <Button type="button" variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button type="submit" variant="solid" style={{ fontWeight: "600", cursor: "pointer" }}>
                      Send Invitation
                    </Button>
                  </Flex>
                </Flex>
              </form>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>
      </Flex>

      {/* ================= MEMBERS STRUCTURAL TABLE LAYER ================= */}
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
            <Table.Row style={{}}>
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
                MFA
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
            {filteredMembers.map((member) => (
              <Table.Row
                key={member.id}
                style={{
                  alignItems: "center",
                }}
              >
                {/* Member Identity Details Column */}
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
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </Box>
                    <Flex align="center" gap="2">
                      <Text size="2" weight="medium" style={{ color: "var(--gray-12)" }}>
                        {member.email}
                      </Text>
                      {member.isYou && (
                        <Badge
                          color="gray"
                          variant="surface"
                          radius="full"
                          style={{ fontSize: "10px", padding: "0 6px", textTransform: "uppercase" }}
                        >
                          You
                        </Badge>
                      )}
                      {member.status === "INVITED" && (
                        <Badge
                          color="orange"
                          variant="ghost"
                          style={{
                            fontSize: "10px",
                            padding: "0 6px",
                            fontWeight: "600",
                            backgroundColor: "var(--orange-2)",
                            border: "1px solid var(--orange-4)",
                            color: "var(--orange-11)"
                          }}
                        >
                          INVITED
                        </Badge>
                      )}
                    </Flex>
                  </Flex>
                </Table.RowHeaderCell>

                {/* MFA Column */}
                <Table.Cell style={{ padding: "16px", verticalAlign: "middle" }}>
                  <Flex align="center" gap="1">
                    <Text size="2" style={{ color: "var(--gray-11)" }}>
                      {member.mfa}
                    </Text>
                    <Cross2Icon width="14" height="14" color="var(--gray-8)" />
                  </Flex>
                </Table.Cell>

                {/* Role Level Column */}
                <Table.Cell style={{ padding: "16px", verticalAlign: "middle" }}>
                  <Text size="2" style={{ color: "var(--gray-12)" }}>
                    {member.role}
                  </Text>
                </Table.Cell>

                {/* Context-Dependent CTA Configurations Column */}
                <Table.Cell style={{ padding: "16px", verticalAlign: "middle" }}>
                  <Flex justify="end" align="center" gap="2">
                    {member.isYou ? (
                      <Button variant="outline" color="gray" size="1" radius="md" style={{ padding: "0 12px", height: "28px" }}>
                        Leave team
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" color="gray" size="1" radius="md" style={{ padding: "0 12px", height: "28px" }}>
                          Manage access
                        </Button>
                        <IconButton variant="ghost" color="gray" size="1">
                          <DotsVerticalIcon />
                        </IconButton>
                      </>
                    )}
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {/* ================= TABLE FOOTER RUNTIME LOGS ================= */}
        <Box px="4" py="3" style={{ backgroundColor: "var(--gray-1)" }}>
          <Text size="2" style={{ color: "var(--gray-10)" }}>
            {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}