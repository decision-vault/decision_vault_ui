import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Flex, Heading, Text, Button, Badge, Card, Select, Dialog, TextArea, Spinner, Grid, Separator,
} from '@radix-ui/themes';
import { AlertTriangle, Lightbulb, Pencil, Trash2, Inbox, PlusIcon } from 'lucide-react';
import { useToast } from '../../components/Toast';
import {
  listFeedback,
  updateFeedback,
  withdrawFeedback,
} from '../../services/feedbackApi';
import FeedbackDialog from '../../components/org/FeedbackDialog';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function FeedbackIssuesPage() {
  const { orgId } = useParams();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Create form dialog
  const [createOpen, setCreateOpen] = useState(false);

  // Edit dialog
  const [editing, setEditing] = useState(null);
  const [editType, setEditType] = useState('idea');
  const [editMessage, setEditMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Withdraw dialog
  const [withdrawing, setWithdrawing] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const load = React.useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await listFeedback(orgId);
      setItems(data?.feedback || []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (statusFilter === 'all' || item.status === statusFilter) &&
          (typeFilter === 'all' || item.type === typeFilter)
      ),
    [items, statusFilter, typeFilter]
  );

  const counts = useMemo(() => {
    const open = items.filter((i) => i.status !== 'withdrawn').length;
    const issues = items.filter((i) => i.type === 'issue').length;
    const ideas = items.filter((i) => i.type === 'idea').length;
    const withdrawn = items.filter((i) => i.status === 'withdrawn').length;
    return { total: items.length, open, issues, ideas, withdrawn };
  }, [items]);

  const openEdit = (item) => {
    setEditing(item);
    setEditType(item.type === 'issue' ? 'issue' : 'idea');
    setEditMessage(item.message || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    if (!editMessage.trim()) {
      toast.error('Update failed', 'Message cannot be empty.');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateFeedback(orgId, editing.id, {
        type: editType,
        message: editMessage,
      });
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success('Feedback updated', 'Your changes have been saved.');
      setEditing(null);
    } catch (err) {
      toast.error('Update failed', err instanceof Error ? err.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawing) return;
    setIsWithdrawing(true);
    try {
      await withdrawFeedback(orgId, withdrawing.id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === withdrawing.id
            ? { ...item, status: 'withdrawn', withdrawn_at: new Date().toISOString() }
            : item
        )
      );
      toast.success('Feedback withdrawn', 'This submission is no longer visible to your team.');
      setWithdrawing(null);
    } catch (err) {
      toast.error('Withdraw failed', err instanceof Error ? err.message : undefined);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const statusBadge = (status) => {
    const isWithdrawn = status === 'withdrawn';
    return (
      <Badge size="1" color={isWithdrawn ? 'gray' : 'green'} variant="soft" radius="full">
        {isWithdrawn ? 'Withdrawn' : 'Open'}
      </Badge>
    );
  };

  const typeBadge = (type) => (
    <Flex align="center" gap="1">
      <Box style={{ color: type === 'issue' ? '#c2410c' : '#b45309', display: 'flex', alignItems: 'center' }}>
        {type === 'issue' ? <AlertTriangle size={14} strokeWidth={2} /> : <Lightbulb size={14} strokeWidth={2} />}
      </Box>
      <Text size="1" weight="bold" style={{ color: 'var(--gray-12)' }}>
        {type === 'issue' ? 'Issue' : 'Idea'}
      </Text>
    </Flex>
  );

  return (
    <Box style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }} px="4" py="4">
      {/* Page Header */}
      <Flex justify="between" align="center" wrap="wrap" gap="3" mb="4">
        <Box>
          <Heading size="6" weight="bold">Feedback &amp; Issues</Heading>
          <Text size="2" color="gray" mt="1">
            Submitted feedback and issues for this organization. You can update or withdraw submissions.
          </Text>
        </Box>

        <Button size="2" variant="solid" style={{ fontWeight: '600', cursor: 'pointer' }} onClick={() => setCreateOpen(true)}>
          <PlusIcon size={14} /> New feedback
        </Button>
      </Flex>

      <FeedbackDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        orgId={orgId}
        onSubmitted={() => load()}
      />

      {/* Summary chips */}
      <Grid columns={{ initial: '2', sm: '4' }} gap="2" mb="4">
        {[
          { label: 'Total', value: counts.total, color: 'gray' },
          { label: 'Open', value: counts.open, color: 'green' },
          { label: 'Issues', value: counts.issues, color: 'red' },
          { label: 'Ideas', value: counts.ideas, color: 'amber' },
        ].map((chip) => (
          <Card key={chip.label} size="1" style={{ background: 'var(--color-panel-solid)' }}>
            <Text size="1" color="gray" weight="medium">{chip.label.toUpperCase()}</Text>
            <Text size="4" weight="bold" style={{ color: 'var(--gray-12)', display: 'block' }}>
              {chip.value}
            </Text>
          </Card>
        ))}
      </Grid>

      {/* Filters */}
      <Flex gap="3" align="center" mb="4" wrap="wrap">
        <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger size="2" placeholder="Status" />
          <Select.Content>
            <Select.Item value="all">All statuses</Select.Item>
            <Select.Item value="open">Open</Select.Item>
            <Select.Item value="withdrawn">Withdrawn</Select.Item>
          </Select.Content>
        </Select.Root>

        <Select.Root value={typeFilter} onValueChange={setTypeFilter}>
          <Select.Trigger size="2" placeholder="Type" />
          <Select.Content>
            <Select.Item value="all">All types</Select.Item>
            <Select.Item value="issue">Issues</Select.Item>
            <Select.Item value="idea">Ideas</Select.Item>
          </Select.Content>
        </Select.Root>
      </Flex>

      <Separator orientation="horizontal" mb="4" />

      {/* List */}
      {isLoading ? (
        <Flex justify="center" align="center" p="6">
          <Spinner size="3" />
        </Flex>
      ) : loadError ? (
        <Flex direction="column" align="center" gap="3" p="6">
          <Text size="2" color="red">{loadError}</Text>
          <Button variant="soft" color="gray" size="2" style={{ cursor: 'pointer' }} onClick={() => load()}>
            Retry
          </Button>
        </Flex>
      ) : filtered.length === 0 ? (
        <Flex direction="column" align="center" justify="center" gap="3" p="8" style={{ border: '1px dashed var(--gray-5)', borderRadius: 'var(--radius-3)', background: 'var(--gray-2)' }}>
          <Inbox size={24} color="var(--gray-7)" />
          <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>No feedback yet</Text>
          <Text size="1" color="gray">Use the chat bubble in the header to submit feedback or an issue.</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          {filtered.map((item) => {
            const isWithdrawn = item.status === 'withdrawn';
            return (
              <Card
                key={item.id}
                size="1"
                style={{
                  background: 'var(--color-panel-solid)',
                  opacity: isWithdrawn ? 0.65 : 1,
                }}
              >
                <Flex align="start" justify="between" gap="3" p="1">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Flex align="center" gap="2" mb="1">
                      {typeBadge(item.type)}
                      {statusBadge(item.status)}
                    </Flex>
                    <Text size="2" weight="medium" style={{ color: 'var(--gray-12)', whiteSpace: 'pre-wrap' }}>
                      {item.message}
                    </Text>
                    <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
                      {formatDate(item.created_at)} · {item.user_email || 'Unknown submitter'}
                    </Text>
                  </Box>

                  {!isWithdrawn && (
                    <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                      <Button
                        size="1"
                        variant="ghost"
                        color="gray"
                        style={{ cursor: 'pointer' }}
                        onClick={() => openEdit(item)}
                      >
                        <Pencil size={12} /> Edit
                      </Button>
                      <Button
                        size="1"
                        variant="ghost"
                        color="red"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setWithdrawing(item)}
                      >
                        <Trash2 size={12} /> Withdraw
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Card>
            );
          })}
        </Flex>
      )}

      {/* Edit dialog */}
      <Dialog.Root open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <Dialog.Content maxWidth="500px">
          <Dialog.Title>Update feedback</Dialog.Title>
          <Dialog.Description size="2" mb="3">
            Edit the type or message of this submission.
          </Dialog.Description>
          <form onSubmit={handleSaveEdit}>
            <Flex direction="column" gap="3">
              <Select.Root value={editType} onValueChange={setEditType}>
                <Select.Trigger size="2" placeholder="Type" />
                <Select.Content>
                  <Select.Item value="issue">Issue</Select.Item>
                  <Select.Item value="idea">Idea</Select.Item>
                </Select.Content>
              </Select.Root>

              <TextArea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                rows={5}
                style={{ resize: 'vertical' }}
              />

              <Flex justify="end" gap="3" mt="2">
                <Button type="button" variant="soft" color="gray" style={{ cursor: 'pointer' }} onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" style={{ cursor: 'pointer' }} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Withdraw dialog */}
      <Dialog.Root open={!!withdrawing} onOpenChange={(open) => { if (!open) setWithdrawing(null); }}>
        <Dialog.Content maxWidth="440px">
          <Dialog.Title>Withdraw feedback?</Dialog.Title>
          <Dialog.Description size="2" mb="3">
            This submission will be marked as withdrawn and hidden from your team. This can't be undone.
          </Dialog.Description>
          <Flex justify="end" gap="3" mt="2">
            <Button type="button" variant="soft" color="gray" style={{ cursor: 'pointer' }} onClick={() => setWithdrawing(null)}>
              Cancel
            </Button>
            <Button color="red" style={{ cursor: 'pointer' }} disabled={isWithdrawing} onClick={handleWithdraw}>
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
