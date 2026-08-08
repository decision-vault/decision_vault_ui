import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDiscovery } from '../state/discoveryStore'
import { useAuth } from '../../../auth/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { createOrganization } from '../../../services/orgApi'
import { createProject, updateProject, getProject } from '../../../services/projectApi'

export function useProductDiscovery() {
  const { orgId: urlOrgId, projectId: urlProjectId } = useParams()
  const {
    ideaText,
    setIdeaText,
    selectedTypes,
    toggleProductType,
    selectedFeatures,
    toggleFeature,
    attachedFiles,
    addFiles,
    removeFile,
    isSubmitting,
    setIsSubmitting,
    draftSaved,
    setDraftSaved,
    saveChatToRecent,
    createdProjectId,
    setCreatedProjectId,
    createdOrgId,
    setCreatedOrgId,
    resetDiscovery,
  } = useDiscovery()

  const { sessionUser, refreshSession } = useAuth()
  const navigate = useNavigate()

  const charCount = ideaText.length
  const isTextValid = charCount >= 300
  const validationWarning = charCount > 0 && charCount < 300
    ? `Please write at least ${300 - charCount} more characters to help the AI design a highly detailed specification.`
    : null

  // Dynamic AI Suggestions based on input text analysis
  const aiSuggestions = useMemo(() => {
    const suggestions = []
    const lowerText = ideaText.toLowerCase()

    if (charCount < 50) {
      suggestions.push({
        id: 'start',
        title: 'Provide more context',
        description: 'Try explaining who your users are and what core problem you are solving.',
        type: 'info',
      })
    } else {
      if (!lowerText.includes('user') && !lowerText.includes('customer') && !lowerText.includes('member')) {
        suggestions.push({
          id: 'users',
          title: 'Define User Personas',
          description: 'Mention who will use this product (e.g. admins, external clients, team members).',
          type: 'warning',
        })
      }
      if (!lowerText.includes('database') && !lowerText.includes('store') && !lowerText.includes('save') && !lowerText.includes('data')) {
        suggestions.push({
          id: 'data',
          title: 'Describe Data Flows',
          description: 'Explain what data needs to be stored or retrieved (e.g. transaction logs, file uploads).',
          type: 'info',
        })
      }
      if (lowerText.includes('payment') || lowerText.includes('stripe') || lowerText.includes('subscribe') || lowerText.includes('checkout')) {
        suggestions.push({
          id: 'payments-hint',
          title: 'Billing Infrastructure',
          description: 'Recommended feature: Subscription billing or single checkout payments. Make sure Stripe is selected.',
          type: 'success',
        })
      }
      if (lowerText.includes('ai') || lowerText.includes('llm') || lowerText.includes('gpt') || lowerText.includes('openai')) {
        suggestions.push({
          id: 'ai-hint',
          title: 'GenAI Capabilities',
          description: 'Recommended: semantic search indices or structured LLM response models. Make sure AI Features is checked.',
          type: 'success',
        })
      }
    }

    // Default suggestions if list is thin
    if (suggestions.length < 3) {
      suggestions.push({
        id: 'prompt-tip',
        title: 'Pro-tip for detailed PRDs',
        description: 'Describe any integrations you need (e.g. Slack, Teams, GitHub) for automated notifications.',
        type: 'info',
      })
    }

    return suggestions
  }, [ideaText, charCount])

  // Example Prompts
  const examplePrompts = [
    {
      label: 'SaaS Project Manager',
      text: 'Build a collaborative project management tool for creative agencies. It needs real-time kanban boards, interactive task list sorting, auto-scheduling based on deadlines, file attachments via drag-and-drop, and an AI chat assistant that summarizes meeting notes and lists outstanding action items for team members.',
    },
    {
      label: 'FinTech Wallet',
      text: 'Create a micro-investing and peer-to-peer wallet application. Users can link bank accounts securely, set up automated round-ups on daily purchases, track portfolio performance with modern interactive SVG charts, buy fractionated stocks, and send instant money transfers using encrypted QR codes.',
    },
    {
      label: 'AI Content Hub',
      text: 'Design an AI-native content generation hub. Users input simple briefs and the system generates blog posts, social graphics, and marketing plans. It needs multi-step workflow review chains, collaborative document editing, user roles (writer, editor, client), and Stripe payment integration.',
    },
  ]

  const applyExamplePrompt = useCallback((text) => {
    setIdeaText(text)
  }, [setIdeaText])

  const handleSaveDraft = useCallback(async () => {
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 3000)
    // Save draft locally for continuity
    try {
      localStorage.setItem('dv_discovery_draft', JSON.stringify({
        ideaText,
        selectedTypes,
        selectedFeatures,
      }))
      // Save to recent list
      saveChatToRecent(ideaText, selectedTypes, selectedFeatures, 'Draft')
    } catch (e) {
      console.error('Failed to save local draft', e)
    }
  }, [ideaText, selectedTypes, selectedFeatures, saveChatToRecent])

  // Load draft on mount, or fetch project details if projectId is provided in path parameters
  useEffect(() => {
    if (urlOrgId && urlProjectId && urlProjectId !== 'undefined') {
      let active = true
      getProject(urlOrgId, urlProjectId)
        .then((project) => {
          if (active && project) {
            if (project.description) {
              setIdeaText(project.description)
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch project description for discovery', err)
        })
      return () => {
        active = false
      }
    } else {
      try {
        const saved = localStorage.getItem('dv_discovery_draft')
        if (saved) {
          const { ideaText: savedText, selectedTypes: savedTypes, selectedFeatures: savedFeatures } = JSON.parse(saved)
          if (savedText && !ideaText) {
            setIdeaText(savedText)
          }
          if (savedTypes && selectedTypes.length === 0) {
            savedTypes.forEach((t) => toggleProductType(t))
          }
          if (savedFeatures && selectedFeatures.length === 0) {
            savedFeatures.forEach((f) => toggleFeature(f))
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [urlOrgId, urlProjectId, setIdeaText])

  const handleStep1Submit = useCallback(async () => {
    if (!isTextValid) return null
    setIsSubmitting(true)
    try {
      const orgId = urlOrgId || sessionUser?.tenant_id
      if (!orgId) {
        throw new Error('No active organization found on your session.')
      }

      const cleanedText = ideaText.trim().replace(/[#*`]/g, '')
      const words = cleanedText.split(/\s+/)
      let name = words.slice(0, 5).join(' ')
      if (words.length > 5) name += '...'
      if (name.length < 3) name = 'New Product Idea'

      // If we are already on an existing project scope, update the existing project instead of creating a new one
      if (urlProjectId && urlProjectId !== 'undefined') {
        await updateProject(orgId, urlProjectId, {
          name,
          description: ideaText,
        })
        setCreatedProjectId(urlProjectId)
        setCreatedOrgId(orgId)
        return { orgId, projectId: urlProjectId }
      }

      const payload = {
        purpose: 'work',
        tools: [],
        features: [],
        workspace_name: sessionUser?.tenant_name || 'My Workspace',
        source: 'product-discovery',
      }
      try {
        await createOrganization(payload)
      } catch (err) {
        console.warn('Organization creation skipped or failed', err)
      }

      const project = await createProject(orgId, {
        name,
        description: ideaText,
      })

      const projectId = project.id || project._id
      setCreatedProjectId(projectId)
      setCreatedOrgId(orgId)

      return { orgId, projectId }
    } catch (e) {
      console.error('Failed to save description to DB', e)
      throw e
    } finally {
      setIsSubmitting(false)
    }
  }, [ideaText, isTextValid, sessionUser, urlOrgId, urlProjectId, setCreatedProjectId, setCreatedOrgId])

  const handleFinalSubmit = useCallback(async (customProjectName = '') => {
    setIsSubmitting(true)
    try {
      const orgId = createdOrgId || urlOrgId || sessionUser?.tenant_id
      const projectId = createdProjectId || urlProjectId

      if (!orgId) {
        throw new Error('No active organization found on your session.')
      }

      let finalProjectName = customProjectName.trim()
      if (!finalProjectName) {
        const cleanedText = ideaText.trim().replace(/[#*`]/g, '')
        const words = cleanedText.split(/\s+/)
        finalProjectName = words.slice(0, 5).join(' ')
        if (words.length > 5) finalProjectName += '...'
        if (finalProjectName.length < 3) finalProjectName = 'New Product Idea'
      }

      let activeProjectId = projectId
      if (!activeProjectId) {
        const payload = {
          purpose: 'work',
          tools: [],
          features: selectedFeatures,
          workspace_name: sessionUser?.tenant_name || 'My Workspace',
          source: 'product-discovery',
        }
        try {
          await createOrganization(payload)
        } catch (err) {
          console.warn('Organization creation skipped or failed', err)
        }
        const project = await createProject(orgId, {
          name: finalProjectName,
          description: ideaText,
        })
        activeProjectId = project.id || project._id
      } else {
        await updateProject(orgId, activeProjectId, {
          name: finalProjectName,
          description: ideaText
        })
        
        const payload = {
          purpose: 'work',
          tools: [],
          features: selectedFeatures,
          workspace_name: sessionUser?.tenant_name || 'My Workspace',
          source: 'product-discovery',
        }
        try {
          await createOrganization(payload)
        } catch (err) {
          console.warn('Organization updates skipped or failed', err)
        }
      }

      saveChatToRecent(ideaText, selectedTypes, selectedFeatures, 'Completed')
      await refreshSession()
      resetDiscovery()

      localStorage.removeItem('dv_discovery_draft')

      navigate(`/organizations/${orgId}/projects/${activeProjectId}/dashboard/overview`)
    } catch (e) {
      console.error('Final workspace generation failed', e)
      throw e
    } finally {
      setIsSubmitting(false)
    }
  }, [
    ideaText,
    selectedTypes,
    selectedFeatures,
    createdProjectId,
    createdOrgId,
    sessionUser,
    navigate,
    refreshSession,
    resetDiscovery,
    saveChatToRecent,
    urlOrgId,
    urlProjectId
  ])

  return {
    charCount,
    isTextValid,
    validationWarning,
    aiSuggestions,
    examplePrompts,
    applyExamplePrompt,
    handleSaveDraft,
    handleStep1Submit,
    handleFinalSubmit,
  }
}
