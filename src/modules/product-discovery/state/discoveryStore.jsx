import React, { createContext, useContext, useState, useCallback } from 'react'

const DiscoveryContext = createContext(null)

const DEFAULT_RECENT_CHATS = [
  {
    id: 'recent-1',
    title: 'AI Telehealth Consultation Hub',
    ideaText: 'Build a mobile health application that links patients with local primary care doctors. Patients can book online consultations, receive digital prescriptions securely, request automated refills, track their vitals (heart rate, sleep quality) via Apple Health integrations, and ask questions to an AI chatbot for general wellness guidance.',
    selectedTypes: ['healthcare', 'ai_tool'],
    selectedFeatures: ['oauth', 'comments', 'semantic', 'stripe'],
    timestamp: '2 hours ago',
    status: 'Completed'
  },
  {
    id: 'recent-2',
    title: 'Collaborative Agency Manager',
    ideaText: 'Build a collaborative project management tool for creative agencies. It needs real-time kanban boards, interactive task list sorting, auto-scheduling based on deadlines, file attachments via drag-and-drop, and an AI chat assistant that summarizes meeting notes and lists outstanding action items for team members.',
    selectedTypes: ['saas', 'dev_tool'],
    selectedFeatures: ['oauth', 'canvas', 'snippets', 'tiers'],
    timestamp: 'Yesterday',
    status: 'Draft'
  }
]

export function DiscoveryProvider({ children }) {
  const [ideaText, setIdeaText] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [createdProjectId, setCreatedProjectId] = useState(null)
  const [createdOrgId, setCreatedOrgId] = useState(null)
  
  const [recentChats, setRecentChats] = useState(() => {
    try {
      const saved = localStorage.getItem('dv_recent_chats')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_RECENT_CHATS
  })

  const toggleProductType = useCallback((typeId) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    )
  }, [])

  const toggleFeature = useCallback((featureId) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    )
  }, [])

  const addFiles = useCallback((files) => {
    setAttachedFiles((prev) => [...prev, ...files])
  }, [])

  const removeFile = useCallback((index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const saveChatToRecent = useCallback((text, types = [], features = [], status = 'Draft') => {
    if (!text || text.trim().length < 10) return
    
    // Extract first 5 words or up to first sentence for the title
    const firstSentence = text.split(/[.!?]/)[0]
    let title = firstSentence.split(/\s+/).slice(0, 5).join(' ')
    if (title.length > 40) {
      title = title.substring(0, 37) + '...'
    }
    
    setRecentChats((prev) => {
      const filtered = prev.filter((item) => item.ideaText.trim() !== text.trim())
      const newChat = {
        id: `recent-${Date.now()}`,
        title: title || 'Unnamed Discovery',
        ideaText: text,
        selectedTypes: types,
        selectedFeatures: features,
        timestamp: 'Just now',
        status: status
      }
      const updated = [newChat, ...filtered]
      localStorage.setItem('dv_recent_chats', JSON.stringify(updated))
      return updated
    })
  }, [])

  const loadRecentChat = useCallback((chat) => {
    setIdeaText(chat.ideaText)
    setSelectedTypes(chat.selectedTypes || [])
    setSelectedFeatures(chat.selectedFeatures || [])
  }, [])

  const deleteRecentChat = useCallback((id) => {
    setRecentChats((prev) => {
      const updated = prev.filter((c) => c.id !== id)
      localStorage.setItem('dv_recent_chats', JSON.stringify(updated))
      return updated
    })
  }, [])

  const resetDiscovery = useCallback(() => {
    setIdeaText('')
    setSelectedTypes([])
    setSelectedFeatures([])
    setAttachedFiles([])
    setIsSubmitting(false)
    setDraftSaved(false)
    setCreatedProjectId(null)
    setCreatedOrgId(null)
  }, [])

  const value = {
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
    recentChats,
    saveChatToRecent,
    loadRecentChat,
    deleteRecentChat,
    createdProjectId,
    setCreatedProjectId,
    createdOrgId,
    setCreatedOrgId,
    resetDiscovery,
  }

  return (
    <DiscoveryContext.Provider value={value}>
      {children}
    </DiscoveryContext.Provider>
  )
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext)
  if (!context) {
    throw new Error('useDiscovery must be used within a DiscoveryProvider')
  }
  return context
}
