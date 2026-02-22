import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import { useAuth } from '../../auth/AuthContext'
import { createBillingCheckout } from '../../services/billingApi'

const PLANS = [
  {
    id: 'starter',
    title: 'Starter',
    price: '$25/mo',
    description: 'Create additional organizations with starter limits.',
  },
  {
    id: 'team',
    title: 'Team',
    price: '$599/mo',
    description: 'Advanced access control and higher usage limits.',
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    price: 'Contact us',
    description: 'Custom contract, SSO, and dedicated support.',
  },
]

export function OrgPlansPage() {
  const navigate = useNavigate()
  const { sessionUser } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState('')
  const [error, setError] = useState('')

  const handleSelectPlan = async (planId) => {
    if (planId === 'enterprise') {
      setError('Enterprise onboarding is manual. Please contact sales.')
      return
    }
    if (!sessionUser?.tenant_id) {
      setError('Missing tenant session. Please sign in again.')
      return
    }

    setError('')
    setLoadingPlan(planId)
    try {
      const checkout = await createBillingCheckout(sessionUser.tenant_id, planId)
      if (checkout?.checkout_url) {
        window.location.href = checkout.checkout_url
        return
      }
      throw new Error('Checkout URL missing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout')
      setLoadingPlan('')
    }
  }

  return (
    <Box p="6">
      <Flex direction="column" gap="5">
        <Heading size="6">Upgrade to create another organization</Heading>
        <Text size="2" color="gray">
          Your first organization is free. To create additional organizations, select a paid plan.
        </Text>

        {error ? (
          <Text size="2" color="red">
            {error}
          </Text>
        ) : null}

        <Grid columns={{ initial: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
          {PLANS.map((plan) => (
            <Card key={plan.id} size="2" variant="surface">
              <Flex direction="column" gap="3">
                <Heading size="4">{plan.title}</Heading>
                <Text size="3" weight="bold">
                  {plan.price}
                </Text>
                <Text size="2" color="gray">
                  {plan.description}
                </Text>
                <Button
                  size="2"
                 
                  disabled={Boolean(loadingPlan && loadingPlan !== plan.id)}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {loadingPlan === plan.id ? 'Redirecting...' : plan.id === 'enterprise' ? 'Contact sales' : 'Choose plan'}
                </Button>
              </Flex>
            </Card>
          ))}
        </Grid>

        <Box>
          <Button variant="soft" color="gray" size="2" onClick={() => navigate('/organizations')}>
            Back to organizations
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}

