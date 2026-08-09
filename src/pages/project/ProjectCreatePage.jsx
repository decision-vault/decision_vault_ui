import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Card,
  TextArea,
  Separator,
  Badge
} from '@radix-ui/themes'
import { useState } from 'react'
import { createProject } from '../../services/projectApi'

const isElectron = window.decisionVaultDesktop?.isDesktop === true

/* ─── Premium SVG Icons ───────────────────────────────────────── */
const IconProjectPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue-9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'float-icon 3s ease-in-out infinite' }}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
    <line x1="12" x2="12" y1="10" y2="16"/>
    <line x1="9" x2="15" y1="13" y2="13"/>
  </svg>
)

const IconSparkles = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.886a1 1 0 0 1-.95.684H2.93a1 1 0 0 0-.588 1.81l5.021 3.648a1 1 0 0 1 .364 1.118L5.816 22a1 1 0 0 0 1.54 1.118l5.019-3.647a1 1 0 0 1 1.173 0l5.018 3.647a1 1 0 0 0 1.54-1.118l-1.911-5.854a1 1 0 0 1 .364-1.118l5.022-3.649a1 1 0 0 0-.588-1.81h-6.212a1 1 0 0 1-.95-.684z"/></svg>
)

export function ProjectCreatePage() {
  const { orgId } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [localPath, setLocalPath] = useState('')
  const [isPickingFolder, setIsPickingFolder] = useState(false)

  const handleSelectFolder = async () => {
    if (!window.decisionVaultDesktop?.selectFolder) return
    setIsPickingFolder(true)
    try {
      const selected = await window.decisionVaultDesktop.selectFolder()
      if (selected) setLocalPath(selected)
    } catch (err) {
      console.error('Folder selection failed:', err)
    } finally {
      setIsPickingFolder(false)
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    setError('')
    try {
      const projectDir = localPath ? `${localPath}/${name.trim()}` : ''
      await createProject(orgId, {
        name: name.trim(),
        description: description.trim() || undefined,
        project_dir: projectDir || undefined,
      })
      if (isElectron && localPath && name.trim()) {
        const projectFolder = `${localPath}/${name.trim()}`
        await window.decisionVaultDesktop.createDirectory(projectFolder)
      }
      navigate(`/organizations/${orgId}/projects`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box 
      style={{ 
        minHeight: 'calc(100vh - 100px)', 
        background: 'radial-gradient(ellipse at top, var(--blue-1), transparent), var(--gray-1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '32px 16px'
      }}
    >
      <Card 
        variant="classic" 
        size="3" 
        style={{ 
          maxWidth: '520px', 
          width: '100%', 
          borderRadius: '20px', 
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
          background: 'var(--color-panel-solid)',
          animation: 'fade-in-up 0.5s ease-out'
        }}
      >
        <Flex direction="column" gap="5" p="4">
          
          {/* Header block with animation icon */}
          <Flex gap="3" align="center">
            <Box style={{ background: 'var(--blue-3)', padding: '12px', borderRadius: '16px', display: 'flex', flexShrink: 0 }}>
              <IconProjectPlus />
            </Box>
            <Box>
              <Heading size="5" weight="bold" style={{ letterSpacing: '-0.2px' }}>Initialize New Project</Heading>
              <Text size="1" color="gray">Set up workspace, roadmap, and UI builder pipelines.</Text>
            </Box>
          </Flex>

          <Separator size="4" />

          {/* Form fields */}
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text as="label" size="2" weight="bold" color="gray" highContrast>
                  Project Title <span style={{ color: 'var(--red-9)' }}>*</span>
                </Text>
                <Text size="1" color="gray">Maximum 160 characters</Text>
              </Flex>
              <TextField.Root
                placeholder="e.g. Stripe Payment Integration Portal"
                size="3"
                variant="surface"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={160}
                required
                style={{ borderRadius: '10px' }}
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text as="label" size="2" weight="bold" color="gray" highContrast>
                  Project Objective / Description
                </Text>
                <Text size="1" color="gray">Optional</Text>
              </Flex>
              <TextArea
                placeholder="Provide a high-level summary of what the project aims to solve. Clara AI will use this context to pre-generate baseline specifications."
                size="3"
                variant="surface"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
                style={{ minHeight: '100px', borderRadius: '10px' }}
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text as="label" size="2" weight="bold" color="gray" highContrast>
                  Project Directory
                </Text>
                {!isElectron && <Text size="1" color="gray">Where agents will run commands</Text>}
              </Flex>
              <Flex gap="2" align="center">
                <TextField.Root
                  placeholder={isElectron ? "Select or type a folder path" : "/path/to/your/project"}
                  size="3"
                  variant="surface"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  style={{ borderRadius: '10px', flex: 1 }}
                />
                {isElectron && (
                  <Button
                    type="button"
                    variant="outline"
                    color="gray"
                    size="3"
                    onClick={handleSelectFolder}
                    disabled={isPickingFolder}
                    style={{ cursor: 'pointer', borderRadius: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                  >
                    {isPickingFolder ? 'Selecting...' : 'Browse'}
                  </Button>
                )}
              </Flex>
              {localPath && (
                <Text size="1" color="gray">
                  Agents will work in: <code style={{ color: 'var(--blue-11)' }}>{localPath}/{name.trim() || '<project-name>'}</code>
                </Text>
              )}
            </Flex>

            {/* Automation Highlights container */}
            <Card variant="soft" color="blue" style={{ padding: '14px', borderRadius: '12px', background: 'var(--blue-2)', border: '1px solid var(--blue-3)' }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Box style={{ color: 'var(--blue-9)', display: 'flex' }}><IconSparkles /></Box>
                  <Text size="1" weight="bold" color="blue">Instant Provisioning Pipeline</Text>
                </Flex>
                <Text size="1" color="blue" style={{ lineHeight: 1.45, opacity: 0.9 }}>
                  Creating a project automatically generates a baseline PRD workspace, initializes Sprint 1 milestones roadmap, and spawns the UI architecture canvas mockup.
                </Text>
              </Flex>
            </Card>

            {error && (
              <Card variant="soft" color="red" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                <Text size="2" color="red" weight="medium">
                  {error}
                </Text>
              </Card>
            )}

            <Separator size="4" />

            {/* Buttons dock */}
            <Flex gap="3" justify="end" align="center">
              <Button variant="ghost" color="gray" size="3" style={{ cursor: 'pointer', borderRadius: '10px', fontWeight: 'bold' }} asChild>
                <Link to={`/organizations/${orgId}/projects`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  Cancel
                </Link>
              </Button>
              <Button 
                type="submit" 
                size="3"
                color="blue"
                disabled={isSubmitting || name.trim().length < 2}
                style={{ cursor: name.trim().length >= 2 ? 'pointer' : 'not-allowed', borderRadius: '10px', fontWeight: 'bold' }}
              >
                {isSubmitting ? 'Provisioning...' : 'Create Project'}
              </Button>
            </Flex>
          </form>

        </Flex>
      </Card>

      <style>{`
        @keyframes fade-in-up {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </Box>
  )
}
