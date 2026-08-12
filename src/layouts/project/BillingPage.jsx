import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Flex, Heading, Text, Button, Table, Badge, TextField, Select, Grid, Dialog, Spinner } from '@radix-ui/themes';
import {
  InfoCircledIcon,
  ExternalLinkIcon,
  FileTextIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  IdCardIcon
} from '@radix-ui/react-icons';
import { useToast } from '../../components/Toast';
import {
  getBillingOverview,
  getBillingPlans,
  changePlan,
  updateBilling,
  addPaymentMethod,
  removePaymentMethod,
  redeemCredit,
} from '../../services/billingApi';

// Reusable Section Template for the Billing UI Blocks
const BillingSection = ({ title, subtitle, infoLink, linkLabel, rightContent }) => (
  <Box style={{ borderTop: '1px solid var(--gray-4)', paddingTop: '32px', paddingBottom: '32px' }}>
    <Grid columns={{ initial: '1', md: '1fr 2fr' }} gap="6">
      <Flex direction="column" gap="2" maxW="340px">
        <Heading size="3" weight="bold" style={{ color: 'var(--gray-12)' }}>{title}</Heading>
        <Text size="2" style={{ color: 'var(--gray-10)', lineHeight: '1.5' }}>{subtitle}</Text>
        {infoLink && (
          <a href={infoLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-2)', color: 'var(--gray-11)', textDecoration: 'none', marginTop: '4px' }}>
            {linkLabel} <ExternalLinkIcon width="12" height="12" />
          </a>
        )}
      </Flex>
      <Box>{rightContent}</Box>
    </Grid>
  </Box>
);

function formatCurrency(amount, currency) {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(value);
  } catch {
    return `$ ${value.toFixed(2)}`;
  }
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusColor(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'paid' || s === 'active') return 'blue';
  if (s === 'open' || s === 'pending') return 'amber';
  if (s === 'failed' || s === 'past_due') return 'red';
  return 'gray';
}

export default function BillingPage() {
  const { orgId } = useParams();
  const toast = useToast();

  const [overview, setOverview] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Plan change dialog
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('lite');
  const [selectedCycle, setSelectedCycle] = useState('monthly');
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Credit redeem dialog
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [creditCode, setCreditCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Email recipient form
  const [billingEmail, setBillingEmail] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Billing address form
  const [address, setAddress] = useState({ full_name: '', country: '', address: '', tax_id: '', tax_id_type: '' });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [isAddingCard, setIsAddingCard] = useState(false);

  const loadBilling = React.useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setLoadError('');
    try {
      const [overviewData, plansData] = await Promise.all([
        getBillingOverview(orgId),
        getBillingPlans(orgId),
      ]);
      setOverview(overviewData);
      setPlans(plansData?.plans || []);
      setSelectedPlan((overviewData?.plan?.plan || 'free') === 'free' ? 'lite' : overviewData?.plan?.plan || 'lite');
      setSelectedCycle(overviewData?.plan?.billing_cycle || 'monthly');
      setBillingEmail(overviewData?.billing_email || '');
      setAdditionalEmails((overviewData?.additional_emails || []).join('\n'));
      setAddress({
        full_name: overviewData?.address?.full_name || '',
        country: overviewData?.address?.country || '',
        address: overviewData?.address?.address || '',
        tax_id: overviewData?.address?.tax_id || '',
        tax_id_type: overviewData?.address?.tax_id_type || '',
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load billing details');
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  const currentPlan = overview?.plan || {};
  const planLabel = overview?.plan_name || (currentPlan.plan || 'Free');
  const invoices = useMemo(() => overview?.invoices || [], [overview]);
  const paymentMethods = useMemo(() => overview?.payment_methods || [], [overview]);
  const quotas = currentPlan.quotas || {};

  const handleChangePlan = async (e) => {
    e?.preventDefault();
    if (!orgId || !selectedPlan) return;
    setIsChangingPlan(true);
    try {
      const updated = await changePlan(orgId, { plan: selectedPlan, billing_cycle: selectedCycle });
      setOverview(updated);
      toast.success('Plan updated', `${planLabel} → ${selectedPlan}`);
      setIsPlanDialogOpen(false);
    } catch (err) {
      toast.error('Failed to update plan', err instanceof Error ? err.message : undefined);
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleToggleSpendCap = async () => {
    if (!orgId) return;
    try {
      const updated = await updateBilling(orgId, { spend_cap_enabled: !overview?.spend_cap_enabled });
      setOverview(updated);
      toast.success('Spend cap updated', `Spend cap ${updated.spend_cap_enabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      toast.error('Failed to update spend cap', err instanceof Error ? err.message : undefined);
    }
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    if (!orgId) return;
    setIsSavingEmail(true);
    try {
      const updated = await updateBilling(orgId, {
        billing_email: billingEmail,
        additional_emails: additionalEmails
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setOverview(updated);
      toast.success('Billing email saved', 'Your billing recipients have been updated.');
    } catch (err) {
      toast.error('Failed to save billing email', err instanceof Error ? err.message : undefined);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!orgId) return;
    setIsSavingAddress(true);
    try {
      const updated = await updateBilling(orgId, { address });
      setOverview(updated);
      toast.success('Billing address saved', 'Your billing address has been updated.');
    } catch (err) {
      toast.error('Failed to save billing address', err instanceof Error ? err.message : undefined);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!orgId || !creditCode.trim()) return;
    setIsRedeeming(true);
    try {
      const updated = await redeemCredit(orgId, creditCode.trim());
      setOverview(updated);
      toast.success('Credit redeemed', `${formatCurrency(updated.credit_balance, overview?.currency)} balance available.`);
      setCreditCode('');
      setIsRedeemOpen(false);
    } catch (err) {
      toast.error('Failed to redeem code', err instanceof Error ? err.message : undefined);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleAddCard = async () => {
    if (!orgId) return;
    setIsAddingCard(true);
    try {
      const updated = await addPaymentMethod(orgId, { token: 'tok_visa' });
      setOverview(updated);
      toast.success('Payment method added', 'A new card was added to this organization.');
    } catch (err) {
      toast.error('Failed to add card', err instanceof Error ? err.message : undefined);
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleRemoveCard = async (methodId) => {
    if (!orgId || !window.confirm('Remove this payment method?')) return;
    try {
      const updated = await removePaymentMethod(orgId, methodId);
      setOverview(updated);
      toast.success('Payment method removed', 'The card is no longer available for billing.');
    } catch (err) {
      toast.error('Failed to remove card', err instanceof Error ? err.message : undefined);
    }
  };

  if (!orgId) {
    return (
      <Flex justify="center" p="6">
        <Spinner />
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex justify="center" p="6" style={{ minHeight: '300px' }} align="center">
        <Spinner />
      </Flex>
    );
  }

  if (loadError) {
    return (
      <Box p="6" style={{ maxWidth: 720, margin: '0 auto' }}>
        <Text size="2" color="red">{loadError}</Text>
      </Box>
    );
  }

  const quotaSummary = (() => {
    const labels = { projects: 'Projects', team_members: 'Members', storage_mb: 'Storage (MB)' };
    const parts = [];
    for (const key of Object.keys(labels)) {
      const q = quotas[key];
      if (!q) continue;
      const limit = q.limit == null ? '∞' : q.limit;
      parts.push(`${labels[key]}: ${q.used}/${limit}`);
    }
    return parts.join(' · ');
  })();

  return (
    <Box style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }} px="4" py="4">
      {/* Page Header */}
      <Heading size="6" weight="bold" mb="6">Billing</Heading>

      {/* 1. SUBSCRIPTION PLAN */}
      <BillingSection
        title="Subscription Plan"
        subtitle="Each organization has it's own subscription plan, billing cycle, payment methods and usage quotas."
        rightContent={
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Flex gap="2" align="center">
                <Heading size="5" weight="medium" style={{ color: 'var(--blue-11)' }}>{planLabel} Plan</Heading>
                <Badge color={currentPlan.plan === 'free' ? 'gray' : 'blue'} variant="soft" radius="full">
                  {currentPlan.plan || 'free'} · {currentPlan.billing_cycle || 'monthly'}
                </Badge>
              </Flex>
              <Button variant="outline" color="gray" size="2" radius="md" style={{ cursor: 'pointer' }} onClick={() => setIsPlanDialogOpen(true)}>
                Change subscription plan
              </Button>
            </Flex>
            <Flex gap="3" p="4" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--gray-2)' }} align="start">
              <InfoCircledIcon width="16" height="16" style={{ color: 'var(--gray-11)', mt: '2px' }} />
              <Box>
                <Text size="2" weight="bold" as="div" mb="1" style={{ color: 'var(--gray-12)' }}>This organization is limited by the included usage</Text>
                <Text size="2" style={{ color: 'var(--gray-11)', lineHeight: '1.4' }}>
                  Projects may become unresponsive when this organization exceeds its{' '}
                  <a href="#quota" style={{ color: 'var(--gray-12)' }}>included usage quota</a>. To scale seamlessly, upgrade to a paid plan.
                  {quotaSummary ? <span style={{ display: 'block', marginTop: '8px', color: 'var(--gray-10)' }}>{quotaSummary}</span> : null}
                </Text>
              </Box>
            </Flex>
          </Flex>
        }
      />

      {/* 2. COST CONTROL */}
      <BillingSection
        title="Cost Control"
        subtitle="Allow scaling beyond your plan's included quota."
        infoLink="#spend-cap"
        linkLabel="Spend cap"
        rightContent={
          <Flex direction="column" gap="4">
            <Text size="2" style={{ color: 'var(--gray-11)' }}>If you need to go beyond the included quota, simply switch off your spend cap to pay for additional usage.</Text>
            <Flex gap="4" p="4" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px' }} align="center" justify="between">
              <Flex gap="3" align="center">
                {/* Micro visual indicator container representing the spend cap chart element */}
                <Box style={{ width: '60px', height: '40px', border: '1px solid var(--gray-4)', borderRadius: '4px', backgroundColor: 'var(--gray-1)' }} />
                <Box>
                  <Text size="2" weight="bold" as="div" style={{ color: 'var(--gray-12)' }}>
                    Spend cap is {overview?.spend_cap_enabled ? 'enabled' : 'disabled'}
                  </Text>
                  <Text size="2" style={{ color: 'var(--gray-10)' }}>
                    {overview?.spend_cap_enabled
                      ? "You won't be charged any extra for usage. However, your projects could become unresponsive..."
                      : 'You can be charged for usage beyond your included quota.'}
                  </Text>
                </Box>
              </Flex>
              <Button variant="outline" color="gray" size="2" radius="md" onClick={handleToggleSpendCap}>Change spend cap</Button>
            </Flex>
          </Flex>
        }
      />

      {/* 3. PAST INVOICES */}
      <BillingSection
        title="Past Invoices"
        subtitle="You get an invoice every time you change your plan or when your monthly billing cycle resets."
        rightContent={
          <Box style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', overflow: 'hidden' }}>
            {invoices.length === 0 ? (
              <Flex direction="column" align="center" justify="center" p="6" style={{ backgroundColor: 'var(--color-panel-solid)' }}>
                <FileTextIcon width="24" height="24" style={{ color: 'var(--gray-8)', marginBottom: '8px' }} />
                <Text size="2" style={{ color: 'var(--gray-10)' }}>No invoices yet</Text>
              </Flex>
            ) : (
              <Table.Root variant="ghost">
                <Table.Header style={{ backgroundColor: 'var(--gray-2)' }}>
                  <Table.Row>
                    <Table.ColumnHeaderCell style={{ fontSize: '11px', color: 'var(--gray-10)' }}>DATE</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ fontSize: '11px', color: 'var(--gray-10)' }}>AMOUNT</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ fontSize: '11px', color: 'var(--gray-10)' }}>INVOICE NUMBER</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ fontSize: '11px', color: 'var(--gray-10)' }}>STATUS</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="40px" />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {invoices.map((inv) => (
                    <Table.Row key={inv.id || inv.number} style={{ verticalAlign: 'middle' }}>
                      <Table.Cell><Flex align="center" gap="2"><FileTextIcon color="var(--gray-9)" /> <Text size="2">{formatDate(inv.created_at)}</Text></Flex></Table.Cell>
                      <Table.Cell><Text size="2">{formatCurrency(inv.amount, inv.currency || overview?.currency)}</Text></Table.Cell>
                      <Table.Cell><Text size="2" style={{ fontFamily: 'monospace' }}>{inv.number}</Text></Table.Cell>
                      <Table.Cell><Badge color={statusColor(inv.status)} variant="soft" radius="full">{(inv.status || 'paid').toUpperCase()}</Badge></Table.Cell>
                      <Table.Cell><Button variant="ghost" color="gray" size="1" onClick={() => toast.success('Invoice', `Invoice ${inv.number} is ready.`)}><DownloadIcon /></Button></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
            <Flex justify="between" align="center" px="3" py="2" style={{ backgroundColor: 'var(--gray-1)', borderTop: '1px solid var(--gray-4)' }}>
              <Text size="1" style={{ color: 'var(--gray-10)' }}>Showing {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</Text>
              <Flex gap="1">
                <Button variant="outline" color="gray" size="1" disabled><ChevronLeftIcon /></Button>
                <Button variant="outline" color="gray" size="1" disabled><ChevronRightIcon /></Button>
              </Flex>
            </Flex>
          </Box>
        }
      />

      {/* 4. PAYMENT METHODS */}
      <BillingSection
        title="Payment Methods"
        subtitle="Payments for your subscription are made using the default card."
        rightContent={
          <Box style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', overflow: 'hidden' }}>
            {paymentMethods.length === 0 ? (
              <Flex direction="column" align="center" justify="center" p="6" style={{ backgroundColor: 'var(--color-panel-solid)' }}>
                <IdCardIcon width="24" height="24" style={{ color: 'var(--gray-8)', marginBottom: '8px' }} />
                <Text size="2" style={{ color: 'var(--gray-10)' }}>No payment methods</Text>
              </Flex>
            ) : (
              <Flex direction="column">
                {paymentMethods.map((method) => (
                  <Flex key={method.id} gap="3" align="center" justify="between" px="4" py="3" style={{ borderBottom: '1px solid var(--gray-4)' }}>
                    <Flex gap="3" align="center">
                      <IdCardIcon width="20" height="20" style={{ color: 'var(--gray-8)' }} />
                      <Text size="2" weight="medium">
                        {method.brand || 'Card'} •••• {method.last4 || '••••'}
                      </Text>
                      {method.is_default ? <Badge color="blue" variant="soft" radius="full">Default</Badge> : null}
                    </Flex>
                    <Button variant="ghost" color="gray" size="1" onClick={() => handleRemoveCard(method.id)}>Remove</Button>
                  </Flex>
                ))}
              </Flex>
            )}
            <Flex justify="end" p="2" style={{ backgroundColor: 'var(--gray-1)', borderTop: '1px solid var(--gray-4)' }}>
              <Button size="1" color="gray" variant="outline" onClick={handleAddCard} disabled={isAddingCard}>
                <PlusIcon /> {isAddingCard ? 'Adding...' : 'Add new card'}
              </Button>
            </Flex>
          </Box>
        }
      />

      {/* 5. CREDIT BALANCE */}
      <BillingSection
        title="Credit Balance"
        subtitle="Credits will be applied to future invoices, before charging your payment method..."
        rightContent={
          <Box p="4" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--color-panel-solid)' }}>
            <Flex justify="between" align="center" mb="4">
              <Text size="2" weight="medium">Balance</Text>
              <Text size="5" weight="bold">{formatCurrency(overview?.credit_balance, overview?.currency)}</Text>
            </Flex>
            <Flex justify="end" gap="2">
              <Button size="1" variant="outline" color="gray" onClick={() => setIsRedeemOpen(true)}>Redeem Code</Button>
              <Button size="1" variant="outline" color="gray" onClick={() => toast.success('Top Up', 'Topping up credit is handled through checkout.')}>
                Top Up
              </Button>
            </Flex>
          </Box>
        }
      />

      {/* 6. EMAIL RECIPIENT */}
      <BillingSection
        title="Email Recipient"
        subtitle="All billing correspondence will go to this email."
        rightContent={
          <Box p="4" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--color-panel-solid)' }} asChild>
            <form onSubmit={handleSaveEmail}>
              <Flex direction="column" gap="3">
                <Box>
                  <Text size="1" weight="medium" as="div" mb="1" style={{ color: 'var(--gray-11)' }}>Email address</Text>
                  <TextField.Root value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="billing@example.com" size="2" radius="md" type="email" />
                </Box>
                <Box>
                  <Flex align="center" gap="1" mb="1">
                    <Text size="1" weight="medium" style={{ color: 'var(--gray-11)' }}>Additional emails</Text>
                    <InfoCircledIcon width="12" height="12" color="var(--gray-8)" />
                  </Flex>
                  <TextField.Root value={additionalEmails} onChange={(e) => setAdditionalEmails(e.target.value)} placeholder="Add additional recipients (comma separated)" size="2" radius="md" />
                </Box>
                <Flex justify="end" gap="2" mt="2">
                  <Button size="2" variant="soft" color="gray" type="button" onClick={() => {
                    setBillingEmail(overview?.billing_email || '');
                    setAdditionalEmails((overview?.additional_emails || []).join('\n'));
                  }}>Cancel</Button>
                  <Button size="2" variant="solid" color="blue" type="submit" disabled={isSavingEmail}>{isSavingEmail ? 'Saving...' : 'Save'}</Button>
                </Flex>
              </Flex>
            </form>
          </Box>
        }
      />

      {/* 7. BILLING ADDRESS & TAX ID */}
      <BillingSection
        title="Billing Address & Tax ID"
        subtitle="Changes will be reflected in every upcoming invoice, past invoices are not affected. A Tax ID is only required for registered businesses."
        rightContent={
          <Box p="4" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--color-panel-solid)' }} asChild>
            <form onSubmit={handleSaveAddress}>
              <Flex direction="column" gap="3">
                <Box>
                  <Text size="1" weight="medium" as="div" mb="1" style={{ color: 'var(--gray-11)' }}>Full name</Text>
                  <TextField.Root value={address.full_name} onChange={(e) => setAddress((prev) => ({ ...prev, full_name: e.target.value }))} size="2" radius="md" />
                </Box>
                <Box>
                  <Text size="1" weight="medium" as="div" mb="1" style={{ color: 'var(--gray-11)' }}>Country or region</Text>
                  <Select.Root value={address.country || undefined} onValueChange={(v) => setAddress((prev) => ({ ...prev, country: v }))}>
                    <Select.Trigger size="2" radius="md" style={{ width: '100%' }} placeholder="Select country" />
                    <Select.Content>
                      <Select.Item value="in">India</Select.Item>
                      <Select.Item value="us">United States</Select.Item>
                      <Select.Item value="gb">United Kingdom</Select.Item>
                      <Select.Item value="sg">Singapore</Select.Item>
                      <Select.Item value="de">Germany</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box>
                  <Text size="1" weight="medium" as="div" mb="1" style={{ color: 'var(--gray-11)' }}>Address</Text>
                  <TextField.Root value={address.address} onChange={(e) => setAddress((prev) => ({ ...prev, address: e.target.value }))} size="2" radius="md" />
                </Box>
                <Box>
                  <Flex align="center" gap="1" mb="1">
                    <Text size="1" weight="medium" style={{ color: 'var(--gray-11)' }}>Business Tax ID</Text>
                    <InfoCircledIcon width="12" height="12" color="var(--gray-8)" />
                  </Flex>
                  <Select.Root value={address.tax_id_type || undefined} onValueChange={(v) => setAddress((prev) => ({ ...prev, tax_id_type: v }))}>
                    <Select.Trigger placeholder="Select tax ID" size="2" radius="md" style={{ width: '100%' }} />
                    <Select.Content>
                      <Select.Item value="gst">GSTIN</Select.Item>
                      <Select.Item value="vat">VAT</Select.Item>
                      <Select.Item value="ein">EIN</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
                {address.tax_id_type ? (
                  <Box>
                    <Text size="1" weight="medium" as="div" mb="1" style={{ color: 'var(--gray-11)' }}>Tax ID number</Text>
                    <TextField.Root value={address.tax_id} onChange={(e) => setAddress((prev) => ({ ...prev, tax_id: e.target.value }))} size="2" radius="md" placeholder="Tax ID number" />
                  </Box>
                ) : null}
                <Flex justify="end" gap="2" mt="2">
                  <Button size="2" variant="soft" color="gray" type="button" onClick={() => setAddress({
                    full_name: overview?.address?.full_name || '',
                    country: overview?.address?.country || '',
                    address: overview?.address?.address || '',
                    tax_id: overview?.address?.tax_id || '',
                    tax_id_type: overview?.address?.tax_id_type || '',
                  })}>Cancel</Button>
                  <Button size="2" variant="solid" color="blue" type="submit" disabled={isSavingAddress}>{isSavingAddress ? 'Saving...' : 'Save'}</Button>
                </Flex>
              </Flex>
            </form>
          </Box>
        }
      />

      {/* CHANGE PLAN DIALOG */}
      <Dialog.Root open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <Dialog.Content size="2" style={{ maxWidth: 520, borderRadius: '12px' }}>
          <Dialog.Title>Change subscription plan</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Choose a new plan for this organization. Changes apply immediately.
          </Dialog.Description>
          <Flex direction="column" gap="3" mb="4">
            <Select.Root value={selectedPlan} onValueChange={setSelectedPlan}>
              <Select.Trigger size="2" radius="md" style={{ width: '100%' }} />
              <Select.Content>
                {plans.map((plan) => (
                  <Select.Item key={plan.id} value={plan.id}>
                    {plan.name} — {formatCurrency(selectedCycle === 'yearly' ? plan.price_yearly : plan.price_monthly, plan.currency)}
                    {selectedCycle === 'yearly' && plan.price_yearly > 0 ? ' /yr' : plan.price_monthly > 0 ? ' /mo' : ''}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Select.Root value={selectedCycle} onValueChange={setSelectedCycle}>
              <Select.Trigger size="2" radius="md" style={{ width: '100%' }} />
              <Select.Content>
                <Select.Item value="monthly">Monthly billing</Select.Item>
                <Select.Item value="yearly">Yearly billing</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex justify="end" gap="2">
            <Button size="2" variant="soft" color="gray" onClick={() => setIsPlanDialogOpen(false)}>Cancel</Button>
            <Button size="2" variant="solid" color="blue" onClick={handleChangePlan} disabled={isChangingPlan || !selectedPlan}>
              {isChangingPlan ? 'Updating...' : 'Update plan'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* REDEEM CREDIT DIALOG */}
      <Dialog.Root open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
        <Dialog.Content size="2" style={{ maxWidth: 460, borderRadius: '12px' }}>
          <Dialog.Title>Redeem credit code</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Enter a credit code to add credit to your account balance.
          </Dialog.Description>
          <form onSubmit={handleRedeem}>
            <Flex direction="column" gap="3" mb="4">
              <TextField.Root
                value={creditCode}
                onChange={(e) => setCreditCode(e.target.value)}
                placeholder="e.g. DV50"
                size="2"
                radius="md"
              />
            </Flex>
            <Flex justify="end" gap="2">
              <Button size="2" variant="soft" color="gray" type="button" onClick={() => setIsRedeemOpen(false)}>Cancel</Button>
              <Button size="2" variant="solid" color="blue" type="submit" disabled={isRedeeming || !creditCode.trim()}>
                {isRedeeming ? 'Redeeming...' : 'Redeem'}
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
