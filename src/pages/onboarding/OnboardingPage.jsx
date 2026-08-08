
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrganization, listOrganizations } from '../../services/orgApi'



import { Box, Button, Card, Flex, Heading, Text, TextField, Checkbox } from '@radix-ui/themes'

// Utility component for a section title
function SectionTitle({ children }) {
  return <Text size="2" weight="medium" mb="2">{children}</Text>
}

export function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [purpose, setPurpose] = useState('') // personal | work | school
  const [tools, setTools] = useState([])
  const [features, setFeatures] = useState([])
  const [workspaceName, setWorkspaceName] = useState('')
  const [source, setSource] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate();

  // Redirect if organization already exists
  useEffect(() => {
    const checkOrg = async () => {
      try {
        const res = await listOrganizations();
        if (res?.orgs?.length) {
          navigate('/organizations');
        }
      } catch (e) {
        // ignore errors
      }
    };
    checkOrg();
  }, [navigate]);

  const toggleArray = (arr, value) => {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
  }

  const handleContinuePurpose = () => {
    if (purpose) setStep(2)
  }

const handleSubmit = async () => {
  setSubmitting(true)
  const payload = {
    purpose,
    tools,
    features,
    workspace_name: workspaceName,
    source,
  }
  try {
    // Call API to create organization
    const created = await createOrganization(payload)
    // Brief delay to show animation
    await new Promise((r) => setTimeout(r, 1500))
    navigate('/organizations')
  } catch (e) {
    console.error('Onboarding submit error', e)
  } finally {
    setSubmitting(false)
  }
}

  // Animation container – fades out when submitting
  const containerStyle = submitting
    ? { opacity: 0.5, transition: 'opacity 0.4s ease-in-out' }
    : { opacity: 1, transition: 'opacity 0.4s ease-in-out' }

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card size="3" style={{ width: '360px', padding: '24px', textAlign: 'center', ...containerStyle }}>
        {step === 1 && (
          <>
            <Heading size="5" mb="3">What would you like to use Decision Vault for?</Heading>
            <Flex direction="column" gap="2" align="center" mb="4">
              <Button variant={purpose === 'personal' ? 'solid' : 'soft'} onClick={() => setPurpose('personal')} style={{ width: '100%' }}>Personal</Button>
              <Button variant={purpose === 'work' ? 'solid' : 'soft'} onClick={() => setPurpose('work')} style={{ width: '100%' }}>Work</Button>
              <Button variant={purpose === 'school' ? 'solid' : 'soft'} onClick={() => setPurpose('school')} style={{ width: '100%' }}>School</Button>
            </Flex>
            <Button disabled={!purpose} onClick={handleContinuePurpose} style={{ width: '100%' }}>Continue</Button>
          </>
        )}
        {step === 2 && (
          <>
            <Heading size="5" mb="3">Tell us a bit more</Heading>
            <Box mb="3" textAlign="left">
              <SectionTitle>How did you hear about us?</SectionTitle>
              <TextField.Root placeholder="e.g., Referral, Google, etc." value={source} onChange={(e) => setSource(e.target.value)} size="2" />
            </Box>
            <Box mb="3" textAlign="left">
              <SectionTitle>Invite people to your Workspace (optional)</SectionTitle>
              <Text size="1" color="gray">You can skip this step.</Text>
            </Box>
            <Box mb="3" textAlign="left">
              <SectionTitle>Do you use any of these tools?</SectionTitle>
              {['Dropbox','Asana','Basecamp','Excel & CSV','Jira','Slack','Figma','Google Drive','Trello','MS Teams','Confluence','Zoom','Wrike','Monday','Salesforce','GitHub','Todoist','Notion'].map((tool) => (
                <Flex key={tool} align="center" gap="2" mb="1">
                  <Checkbox checked={tools.includes(tool)} onCheckedChange={() => setTools(toggleArray(tools, tool))} />
                  <Text size="2">{tool}</Text>
                </Flex>
              ))}
            </Box>
            <Box mb="3" textAlign="left">
              <SectionTitle>Which features are you interested in trying?</SectionTitle>
              {['Automations','Sprints','Chat','Whiteboards','Goals & OKRs','Gantt Charts','Calendar','Time Tracking','Clips','Workload','Tasks & Projects','Docs & Wikis','CRM','Scheduling','AI','Dashboards','Boards & Kanban','Forms'].map((feat) => (
                <Flex key={feat} align="center" gap="2" mb="1">
                  <Checkbox checked={features.includes(feat)} onCheckedChange={() => setFeatures(toggleArray(features, feat))} />
                  <Text size="2">{feat}</Text>
                </Flex>
              ))}
            </Box>
            <Box mb="3" textAlign="left">
              <SectionTitle>Workspace name</SectionTitle>
              <TextField.Root placeholder="Enter workspace name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} size="2" />
            </Box>
            <Flex gap="2" justify="end">
              <Button variant="soft" onClick={() => setStep(1)} disabled={submitting}>Back</Button>
              <Button onClick={handleSubmit} disabled={submitting}> {submitting ? 'Setting up...' : 'Finish'} </Button>
            </Flex>
          </>
        )}
      </Card>
    </Box>
  )
}
