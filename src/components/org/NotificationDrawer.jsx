import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Flex, Text, Button, Tabs, Select, Spinner, Separator } from "@radix-ui/themes";
import { ChevronDown, X, ShieldAlert, Activity, MessageSquare, Info, CheckCheck, Inbox } from "lucide-react";
import { useToast } from "../Toast";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  connectNotificationStream,
} from "../../services/notificationApi";

const TYPE_META = {
  security: { icon: ShieldAlert, color: "#dc2626" },
  performance: { icon: Activity, color: "#0ea5e9" },
  messages: { icon: MessageSquare, color: "#8b5cf6" },
  system: { icon: Info, color: "var(--gray-9)" },
};

const SEVERITY_META = {
  1: { color: "var(--red-9)" },
  2: { color: "var(--amber-9)" },
  3: { color: "var(--blue-9)" },
};

const TABS = [
  { value: "all", label: "All" },
  { value: "security", label: "Security" },
  { value: "performance", label: "Performance" },
  { value: "messages", label: "Messages" },
];

function relativeTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationDrawer({ onClose, orgId }) {
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await listNotifications(orgId, { limit: 100 });
      setItems(data?.notifications || []);
      setUnread(Number(data?.unread) || 0);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!orgId) return;
    let active = true;
    const stop = connectNotificationStream({
      orgId,
      onNotification: (notification) => {
        if (!active) return;
        setItems((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev;
          return [notification, ...prev];
        });
        setUnread((u) => u + 1);
      },
    });
    return () => {
      active = false;
      stop();
    };
  }, [orgId]);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (activeTab !== "all" && n.type !== activeTab) return false;
      if (statusFilter === "read" && !n.is_read) return false;
      if (statusFilter === "unread" && n.is_read) return false;
      if (severityFilter !== "all" && Number(n.severity) !== Number(severityFilter)) return false;
      return true;
    });
  }, [items, activeTab, statusFilter, severityFilter]);

  const handleMarkRead = async (item) => {
    if (item.is_read) return;
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await markNotificationRead(orgId, item.id);
    } catch {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: false } : n)));
      setUnread((u) => u + 1);
      toast.error("Update failed", "Could not mark notification as read.");
    }
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    try {
      await markAllNotificationsRead(orgId);
    } catch {
      toast.error("Update failed", "Could not mark all notifications as read.");
      load();
    }
  };

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={setActiveTab}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "white",
        fontFamily: "var(--default-font-family, inherit)",
      }}
    >
      {/* Header */}
      <Flex
        align="center"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-5)",
          paddingRight: "16px",
          paddingLeft: "8px",
        }}
      >
        <Tabs.List size="2" style={{ boxShadow: "none" }}>
          {TABS.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value}>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Flex gap="3" align="center">
          <Button
            variant="ghost"
            size="1"
            color="gray"
            onClick={handleMarkAllRead}
            style={{ cursor: "pointer", color: "var(--gray-12)", fontWeight: 400, padding: "4px 8px", height: "auto" }}
          >
            <CheckCheck size={14} color="var(--gray-11)" /> Mark all read
          </Button>

          <Box ml="2" style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="ghost"
              color="gray"
              onClick={onClose}
              style={{ padding: 0, margin: 0, height: "auto", cursor: "pointer" }}
            >
              <X size={16} color="var(--gray-11)" strokeWidth={1.5} />
            </Button>
          </Box>
        </Flex>
      </Flex>

      {/* Filters */}
      <Flex gap="2" px="3" py="2" align="center" style={{ borderBottom: "1px solid var(--gray-5)" }}>
        <Select.Root size="1" value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger placeholder="Status" style={{ height: "26px", fontSize: "var(--font-size-1)" }} />
          <Select.Content>
            <Select.Item value="all">All statuses</Select.Item>
            <Select.Item value="unread">Unread</Select.Item>
            <Select.Item value="read">Read</Select.Item>
          </Select.Content>
        </Select.Root>

        <Select.Root size="1" value={severityFilter} onValueChange={setSeverityFilter}>
          <Select.Trigger placeholder="Severity" style={{ height: "26px", fontSize: "var(--font-size-1)" }} />
          <Select.Content>
            <Select.Item value="all">All severities</Select.Item>
            <Select.Item value="3">Severity: 3</Select.Item>
            <Select.Item value="2">Severity: 2</Select.Item>
            <Select.Item value="1">Severity: 1</Select.Item>
          </Select.Content>
        </Select.Root>

        {unread > 0 && (
          <Text size="1" color="gray" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>
            {unread} unread
          </Text>
        )}
      </Flex>

      {/* Body */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        {isLoading ? (
          <Flex justify="center" align="center" style={{ height: "100%", padding: "32px" }}>
            <Spinner size="3" />
          </Flex>
        ) : loadError ? (
          <Flex direction="column" align="center" justify="center" gap="3" style={{ height: "100%", padding: "32px" }}>
            <Text size="2" color="red" style={{ textAlign: "center" }}>{loadError}</Text>
            <Button variant="outline" color="gray" size="2" style={{ cursor: "pointer" }} onClick={() => load()}>
              Retry
            </Button>
          </Flex>
        ) : filtered.length === 0 ? (
          <Flex direction="column" align="center" justify="center" style={{ height: "100%", padding: "32px" }}>
            <Box style={{ color: "var(--gray-11)", marginBottom: "16px" }}>
              <Inbox size={24} strokeWidth={1.5} />
            </Box>
            <Text size="3" weight="medium" style={{ color: "var(--gray-12)" }}>
              No notifications
            </Text>
            <Text size="2" mt="1" style={{ color: "var(--gray-11)", textAlign: "center" }}>
              New activity will appear here in real time.
            </Text>
          </Flex>
        ) : (
          <Flex direction="column">
            {filtered.map((item) => {
              const meta = TYPE_META[item.type] || TYPE_META.system;
              const Icon = meta.icon;
              const severity = SEVERITY_META[Number(item.severity)] || SEVERITY_META[2];
              return (
                <Flex
                  key={item.id}
                  gap="3"
                  align="start"
                  px="4"
                  py="3"
                  onClick={() => handleMarkRead(item)}
                  style={{
                    borderBottom: "1px solid var(--gray-4)",
                    cursor: "pointer",
                    backgroundColor: item.is_read ? "white" : "var(--blue-2)",
                    transition: "background 0.15s ease",
                  }}
                >
                  <Box style={{ color: meta.color, display: "flex", alignItems: "center", marginTop: "2px", flexShrink: 0 }}>
                    <Icon size={18} strokeWidth={1.75} />
                  </Box>

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Flex align="center" gap="2" mb="1">
                      <Text size="2" weight="bold" style={{ color: "var(--gray-12)" }}>
                        {item.title}
                      </Text>
                      {!item.is_read && <Box style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--blue-9)", flexShrink: 0 }} />}
                    </Flex>
                    {item.message ? (
                      <Text as="div" size="2" style={{ color: "var(--gray-11)", lineHeight: "1.5" }}>
                        {item.message}
                      </Text>
                    ) : null}
                    <Flex align="center" gap="2" mt="1">
                      <Box style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: severity.color }} />
                      <Text size="1" style={{ color: "var(--gray-9)" }}>
                        Severity {item.severity} · {relativeTime(item.created_at)}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              );
            })}
          </Flex>
        )}
      </Box>
    </Tabs.Root>
  );
}
