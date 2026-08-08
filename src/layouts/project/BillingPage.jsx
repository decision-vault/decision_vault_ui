import React from 'react';
import { Box, Flex, Heading, Text, Button, Table, Badge, TextField, Select, Grid } from '@radix-ui/themes';
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

export default function BillingPage() {
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
              <Heading size="5" weight="medium" style={{ color: 'var(--blue-11)' }}>Free Plan</Heading>
              <Button variant="outline" color="gray" size="2" radius="md" style={{ cursor: 'pointer' }}>
                Change subscription plan
              </Button>
            </Flex>
            <Flex gap="3" p="4" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--gray-2)' }} align="start">
              <InfoCircledIcon width="16" height="16" style={{ color: 'var(--gray-11)', mt: '2px' }} />
              <Box>
                <Text size="2" weight="bold" as="div" mb="1" style={{ color: 'var(--gray-12)' }}>This organization is limited by the included usage</Text>
                <Text size="2" style={{ color: 'var(--gray-11)', lineHeight: '1.4' }}>
                  Projects may become unresponsive when this organization exceeds its <a href="#quota" style={{ color: 'var(--gray-12)' }}>included usage quota</a>. To scale seamlessly, upgrade to a paid plan.
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
                  <Text size="2" weight="bold" as="div" style={{ color: 'var(--gray-12)' }}>Spend cap is enabled</Text>
                  <Text size="2" style={{ color: 'var(--gray-10)' }}>You won't be charged any extra for usage. However, your projects could become unresponsive...</Text>
                </Box>
              </Flex>
              <Button variant="outline" color="gray" size="2" radius="md">Change spend cap</Button>
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
            <Table.Root variant="surface">
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
                {[
                  { date: 'Jun 25, 2026', id: 'ZSFGMP-00022' },
                  { date: 'May 25, 2026', id: 'ZSFGMP-00021' },
                  { date: 'Apr 25, 2026', id: 'ZSFGMP-00020' },
                  { date: 'Mar 25, 2026', id: 'ZSFGMP-00019' },
                  { date: 'Feb 25, 2026', id: 'ZSFGMP-00018' },
                ].map((inv, idx) => (
                  <Table.Row key={idx} style={{ verticalAlign: 'middle' }}>
                    <Table.Cell><Flex align="center" gap="2"><FileTextIcon color="var(--gray-9)" /> <Text size="2">{inv.date}</Text></Flex></Table.Cell>
                    <Table.Cell><Text size="2">$0.00</Text></Table.Cell>
                    <Table.Cell><Text size="2" style={{ fontFamily: 'monospace' }}>{inv.id}</Text></Table.Cell>
                    <Table.Cell><Badge color="blue" variant="soft" radius="full">PAID</Badge></Table.Cell>
                    <Table.Cell><Button variant="ghost" color="gray" size="1"><DownloadIcon /></Button></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
            <Flex justify="between" align="center" px="3" py="2" style={{ backgroundColor: 'var(--gray-1)', borderTop: '1px solid var(--gray-4)' }}>
              <Text size="1" style={{ color: 'var(--gray-10)' }}>Showing 1 to 5 of 29 invoices</Text>
              <Flex gap="1">
                <Button variant="outline" color="gray" size="1" disabled><ChevronLeftIcon /></Button>
                <Button variant="outline" color="gray" size="1"><ChevronRightIcon /></Button>
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
            <Flex direction="column" align="center" justify="center" p="6" style={{ backgroundColor: 'var(--color-panel-solid)' }}>
              <IdCardIcon width="24" height="24" style={{ color: 'var(--gray-8)', marginBottom: '8px' }} />
              <Text size="2" style={{ color: 'var(--gray-10)' }}>No payment methods</Text>
            </Flex>
            <Flex justify="end" p="2" style={{ backgroundColor: 'var(--gray-1)', borderTop: '1px solid var(--gray-4)' }}>
              <Button size="1" color="gray" variant="outline"><PlusIcon /> Add new card</Button>
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
              <Text size="5" weight="bold">$ 0.00</Text>
            </Flex>
            <Flex justify="end" gap="2">
              <Button size="1" variant="outline" color="gray">Redeem Code</Button>
              <Button size="1" variant="outline" color="gray">Top Up</Button>
            </Flex>
          </Box>
        }
      />

      {/* 6. EMAIL RECIPIENT */}
      <BillingSection
        title="Email Recipient"
        subtitle="All billing correspondence will go to this email."
        rightContent={
          <Box p="4" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--color-panel-solid)' }}>
            <Flex direction="column" gap="3">
              <Box>
                <Text size="1" weight="medium" as="div" mb="1" style={{ color: 'var(--gray-11)' }}>Email address</Text>
                <TextField.Root defaultValue="kaviyarasumaran@gmail.com" size="2" radius="md" />
              </Box>
              <Box>
                <Flex align="center" gap="1" mb="1">
                  <Text size="1" weight="medium" style={{ color: 'var(--gray-11)' }}>Additional emails</Text>
                  <InfoCircledIcon width="12" height="12" color="var(--gray-8)" />
                </Flex>
                <TextField.Root placeholder="Add additional recipients" size="2" radius="md" />
              </Box>
              <Flex justify="end" gap="2" mt="2">
                <Button size="2" variant="soft" color="gray">Cancel</Button>
                <Button size="2" variant="solid" color="blue">Save</Button>
              </Flex>
            </Flex>
          </Box>
        }
      />

      {/* 7. BILLING ADDRESS & TAX ID */}
      <BillingSection
        title="Billing Address & Tax ID"
        subtitle="Changes will be reflected in every upcoming invoice, past invoices are not affected. A Tax ID is only required for registered businesses."
        rightContent={
          <Box p="4" style={{ border: '1px solid var(--gray-4)', borderRadius: '8px', backgroundColor: 'var(--color-panel-solid)' }}>
            <Flex direction="column" gap="3">
              <Box>
                <Text size="1" weight="medium" as="div" mb="1" style={{ color: 'var(--gray-11)' }}>Full name</Text>
                <TextField.Root defaultValue="bloom-majesty" size="2" radius="md" />
              </Box>
              <Box>
                <Text size="1" weight="medium" as="div" mb="1" style={{ color: 'var(--gray-11)' }}>Country or region</Text>
                <Select.Root defaultValue="in">
                  <Select.Trigger size="2" radius="md" style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="in">India</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
              <Box>
                <Text size="1" weight="medium" as="div" mb="1" style={{ color: 'var(--gray-11)' }}>Address</Text>
                <TextField.Root size="2" radius="md" />
              </Box>
              <Box>
                <Flex align="center" gap="1" mb="1">
                  <Text size="1" weight="medium" style={{ color: 'var(--gray-11)' }}>Business Tax ID</Text>
                  <InfoCircledIcon width="12" height="12" color="var(--gray-8)" />
                </Flex>
                <Select.Root>
                  <Select.Trigger placeholder="Select tax ID" size="2" radius="md" style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="gst">GSTIN</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
              <Flex justify="end" gap="2" mt="2">
                <Button size="2" variant="soft" color="gray">Cancel</Button>
                <Button size="2" variant="solid" color="blue">Save</Button>
              </Flex>
            </Flex>
          </Box>
        }
      />
    </Box>
  );
}