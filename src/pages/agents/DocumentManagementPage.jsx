import React, { useState, useMemo, useEffect } from 'react'
import { 
  Box, Flex, Heading, Text, Button, Grid, Badge, 
  Separator, IconButton, Dialog, TextField
} from '@radix-ui/themes'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css' 
import { FileText } from 'lucide-react'
import { DocsManagementService } from '../../services/docManager' // Ensure path correctly matches your structure

// Premium vector theme action icons
const IconPlus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
const IconWorkspace = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconDoc = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconChevronDown = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconBullet = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/></svg>
const IconModel = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],        
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['code-block', 'blockquote'],
    ['clean']                                         
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'code-block', 'blockquote'
]

export default function DocumentManagementPage() {
  const [workspaces, setWorkspaces] = useState([])
  const [activeDocId, setActiveDocId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Radix Modal Dialog States
  const [spaceModalOpen, setSpaceModalOpen] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState('')

  const [modelModalOpen, setModelModalOpen] = useState(false)
  const [newModelName, setNewModelName] = useState('')
  const [targetWorkspaceId, setTargetWorkspaceId] = useState(null)

  // Workspace Purging Modals States
  const [deleteWorkspaceModalOpen, setDeleteWorkspaceModalOpen] = useState(false)
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null)

  //  ADDED: Document File Purging Modals States
  const [deleteDocModalOpen, setDeleteDocModalOpen] = useState(false)
  const [docToDelete, setDocToDelete] = useState(null)

  // Fetch directories on lifecycle mounting
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await DocsManagementService.getAllWorkspaces()
        const mappedData = data.map(ws => ({ ...ws, isOpen: true }))
        setWorkspaces(mappedData)
        
        if (mappedData.length > 0 && mappedData[0].documents?.length > 0) {
          setActiveDocId(mappedData[0].documents[0].id)
        }
      } catch (error) {
        console.error("Failed fetching knowledge database structural maps:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  const activeDocument = useMemo(() => {
    for (const ws of workspaces) {
      const match = ws.documents.find(d => d.id === activeDocId)
      if (match) return { workspaceId: ws.id, ...match }
    }
    return null
  }, [workspaces, activeDocId])

  const toggleWorkspaceAccordion = (workspaceId) => {
    setWorkspaces(prev => prev.map(ws => 
      ws.id === workspaceId ? { ...ws, isOpen: !ws.isOpen } : ws
    ))
  }

  // Synced Content Modifiers targeting patch update loops
  const handleEditorBodySync = async (newHtmlContent) => {
    if (!activeDocId) return
    
    setWorkspaces(prev => prev.map(ws => ({
      ...ws,
      documents: ws.documents.map(doc => doc.id === activeDocId ? { ...doc, body: newHtmlContent } : doc)
    })))

    try {
      await DocsManagementService.syncDocumentContent(activeDocId, { body: newHtmlContent })
    } catch (error) {
      console.error("Backend streaming sync exception dropped:", error)
    }
  }

  const handleTitleSync = async (newTitle) => {
    if (!activeDocId) return

    setWorkspaces(prev => prev.map(ws => ({
      ...ws,
      documents: ws.documents.map(doc => doc.id === activeDocId ? { ...doc, title: newTitle } : doc)
    })))

    try {
      await DocsManagementService.syncDocumentContent(activeDocId, { title: newTitle })
    } catch (error) {
      console.error("Backend streaming sync exception dropped:", error)
    }
  }

  const handleAddNewDocument = async (workspaceId, e) => {
    e.stopPropagation() 
    try {
      const freshDoc = await DocsManagementService.createDocument(workspaceId, {
        title: 'Untitled Document',
        body: '<p><br></p>'
      })
      
      setWorkspaces(prev => prev.map(ws => {
        if (ws.id === workspaceId) {
          return {
            ...ws,
            isOpen: true, 
            documents: [...ws.documents, freshDoc]
          }
        }
        return ws
      }))
      setActiveDocId(freshDoc.id)
    } catch (error) {
      console.error("Failed appending document record:", error)
    }
  }

  const handleAddWorkspaceModelSubmit = async () => {
    if (!newModelName.trim() || !targetWorkspaceId) return

    try {
      const structuredModelTemplate = await DocsManagementService.createDocument(targetWorkspaceId, {
        title: `${newModelName} Blueprint`,
        body: `<h2>${newModelName} Specification</h2>
               <p>Initial system criteria definitions mapping architectural boundary conditions pipelines.</p>
               <blockquote><strong>Classification Matrix:</strong> System Core Flow Trigger Node Block</blockquote>
               <pre><code>// Context Schema Reference Configuration\n{\n  "model_type": "workflow_agent",\n  "isolation_layer": "row_level"\n}</code></pre>`
      })

      setWorkspaces(prev => prev.map(ws => {
        if (ws.id === targetWorkspaceId) {
          return {
            ...ws,
            isOpen: true,
            documents: [...ws.documents, structuredModelTemplate]
          }
        }
        return ws
      }))
      setActiveDocId(structuredModelTemplate.id)
      setModelModalOpen(false)
      setNewModelName('')
    } catch (error) {
      console.error("Failed tracking workspace structural block parameters update maps:", error)
    }
  }

  const handleCreateWorkspaceSubmit = async () => {
    if (!newSpaceName.trim()) return
    try {
      const newWs = await DocsManagementService.createWorkspace({ name: newSpaceName })
      setWorkspaces(prev => [...prev, { ...newWs, isOpen: true, documents: [] }])
      setSpaceModalOpen(false)
      setNewSpaceName('')
    } catch (error) {
      console.error("Failed initializing workspace scope partition:", error)
    }
  }

  const handleDeleteWorkspaceSubmit = async () => {
    if (!workspaceToDelete) return
    try {
      await DocsManagementService.deleteWorkspace(workspaceToDelete.id)
      setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceToDelete.id))
      
      if (activeDocument && activeDocument.workspaceId === workspaceToDelete.id) {
        setActiveDocId(null)
      }
      
      setDeleteWorkspaceModalOpen(false)
      setWorkspaceToDelete(null)
    } catch (error) {
      console.error("Failed to eliminate selected target space allocation:", error)
    }
  }

  //  ADDED: EXECUTE PERMANENT DOCUMENT INDIVIDUAL RECORD PURGE
  const handleDeleteDocumentSubmit = async () => {
    if (!docToDelete) return
    try {
      await DocsManagementService.deleteDocument(docToDelete.id)
      
      // Update workspaces layout structures cleanly tracking filtering loops
      setWorkspaces(prev => prev.map(ws => ({
        ...ws,
        documents: ws.documents.filter(d => d.id !== docToDelete.id)
      })))

      // If we just blew away the current loaded viewport document, unseat active focuses
      if (activeDocId === docToDelete.id) {
        setActiveDocId(null)
      }

      setDeleteDocModalOpen(false)
      setDocToDelete(null)
    } catch (error) {
      console.error("Exception thrown purging tracking document context allocation loop:", error)
    }
  }

  if (isLoading) {
    return (
      <Flex style={{ height: '100vh' }} align="center" justify="center">
        <Text size="2" color="gray" weight="medium">Initializing Workspace Environment...</Text>
      </Flex>
    )
  }

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gray-1)', fontFamily: 'system-ui, sans-serif' }}>

      {/* PAGE HEADER STRIP */}
      <Flex
        px="4"
        align="center"
        justify="between"
        style={{ height: '41px', flexShrink: 0, borderBottom: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}
      >
        <Flex align="center" gap="2">
          <FileText size={14} style={{ color: 'var(--gray-10)' }} />
          <Text size="3" weight="medium">Documents</Text>
        </Flex>
      </Flex>

      {/* STYLE OVERRIDES */}
      <style>{`
        .sidebar-space-group:hover .sidebar-action-trigger {
          opacity: 1 !important;
        }
        .sidebar-doc-row:hover .sidebar-doc-action-trigger {
          opacity: 1 !important;
        }
        .sidebar-doc-item {
          position: relative;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .sidebar-doc-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 3px;
          background: var(--blue-9);
          border-radius: 0 4px 4px 0;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .sidebar-doc-item-active::before {
          opacity: 1;
        }
      `}</style>

      {/* CORE INTERFACE GRID WRAPPER */}
      <Grid columns="290px 1fr" style={{ flexGrow: 1, overflow: 'hidden' }}>
        
        {/* HIGH-FIDELITY SIDEBAR DIRECTORY */}
        <Box p="3" style={{ background: 'var(--color-panel-background)', borderRight: '1px solid var(--gray-4)', overflowY: 'auto' }}>
          
          <Flex justify="between" align="center" mb="4" px="2" pt="2">
            <Text size="1" weight="bold" color="gray" style={{ letterSpacing: '0.6px', textTransform: 'uppercase', opacity: 0.8 }}>
              Workspace Directory
            </Text>
            <IconButton 
              size="1" 
              variant="soft" 
              color="blue" 
              title="Create New Space"
              onClick={() => setSpaceModalOpen(true)}
              style={{ cursor: 'pointer', borderRadius: '6px', width: '22px', height: '22px' }}
            >
              <IconPlus />
            </IconButton>
          </Flex>
          
          <Flex direction="column" gap="1">
            {workspaces.map(ws => (
              <Box key={ws.id} style={{ marginBottom: '6px' }} className="sidebar-space-group">
                
                {/* Space Accordion Bar Segment Frame */}
                <Flex 
                  align="center" 
                  justify="between" 
                  onClick={() => toggleWorkspaceAccordion(ws.id)}
                  style={{ 
                    padding: '6px 8px', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    background: 'transparent',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Flex align="center" gap="2" style={{ minWidth: 0, flexGrow: 1 }}>
                    <Box style={{ 
                      transform: ws.isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', 
                      transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)', 
                      color: 'var(--gray-8)', 
                      display: 'flex' 
                    }}>
                      <IconChevronDown />
                    </Box>
                    <Box style={{ color: 'var(--gray-10)', display: 'flex' }}><IconWorkspace /></Box>
                    <Text size="2" weight="bold" style={{ color: 'var(--gray-12)', letterSpacing: '-0.1px' }} truncate>
                      {ws.name}
                    </Text>
                  </Flex>
                  
                  {/* Action Group Controller Trigger Rails */}
                  <Flex gap="0.5" align="center" onClick={(e) => e.stopPropagation()} style={{ opacity: 0, transition: 'opacity 0.15s' }} className="sidebar-action-trigger">
                    <IconButton 
                      size="1" 
                      variant="ghost" 
                      color="red" 
                      title="Delete Space"
                      onClick={() => {
                        setWorkspaceToDelete(ws);
                        setDeleteWorkspaceModalOpen(true);
                      }} 
                      style={{ cursor: 'pointer', borderRadius: '4px', width: '20px', height: '20px' }}
                    >
                      <IconTrash />
                    </IconButton>

                    <IconButton 
                      size="1" 
                      variant="ghost" 
                      color="blue" 
                      title="Add Model Blueprint"
                      onClick={() => {
                        setTargetWorkspaceId(ws.id);
                        setModelModalOpen(true);
                      }} 
                      style={{ cursor: 'pointer', borderRadius: '4px', width: '20px', height: '20px' }}
                    >
                      <IconModel />
                    </IconButton>
                    <IconButton 
                      size="1" 
                      variant="ghost" 
                      color="gray" 
                      title="Add Blank Doc" 
                      onClick={(e) => handleAddNewDocument(ws.id, e)} 
                      style={{ cursor: 'pointer', borderRadius: '4px', width: '20px', height: '20px' }}
                    >
                      <IconPlus />
                    </IconButton>
                  </Flex>
                </Flex>

                {/* Sub-Tree Nested Files Children Loop Container Frame */}
                <Box style={{ 
                  height: ws.isOpen ? 'auto' : '0px', 
                  overflow: 'hidden', 
                  paddingLeft: '10px', 
                  borderLeft: '1.5px solid var(--gray-4)', 
                  marginLeft: '14px', 
                  marginTop: ws.isOpen ? '2px' : '0px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  {ws.documents?.map(doc => {
                    const isDocActive = activeDocId === doc.id
                    return (
                      <Flex 
                        key={doc.id} 
                        align="center" 
                        justify="between"
                        className="sidebar-doc-row"
                        style={{ width: '100%', position: 'relative' }}
                      >
                        <Button
                          variant={isDocActive ? 'soft' : 'ghost'}
                          color={isDocActive ? 'green' : 'gray'}
                          justify="start"
                          onClick={() => setActiveDocId(doc.id)}
                          className={`sidebar-doc-item ${isDocActive ? 'sidebar-doc-item-active' : ''}`}
                          style={{ 
                            borderRadius: '5px', 
                            height: '30px', 
                            flexGrow: 1,
                            padding: '0 10px',
                            borderTopLeftRadius: '0',
                            borderBottomLeftRadius: '0',
                            paddingRight: '30px' // Leave buffer space tracking hovering action triggers
                          }}
                        >
                          <Flex align="center" gap="2" style={{ minWidth: 0, width: '100%' }}>
                            <Box style={{ flexShrink: 0, opacity: isDocActive ? 1 : 0.5, display: 'flex' }}>
                              <IconDoc />
                            </Box>
                            <Text size="2" truncate style={{ width: '100%', textAlign: 'left', fontWeight: isDocActive ? '600' : '500', color: isDocActive ? 'var(--blue-11)' : 'var(--gray-11)' }}>
                              {doc.title || 'Untitled Document'}
                            </Text>
                          </Flex>
                        </Button>

                        {/*  ADDED: FLOATING ACTION CONSOLE INDIVIDUAL FILE ROW DELETE LINK */}
                        <Box 
                          style={{ 
                            position: 'absolute', 
                            right: '6px', 
                            zIndex: 5, 
                            opacity: 0, 
                            transition: 'opacity 0.12s' 
                          }}
                          className="sidebar-doc-action-trigger"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconButton
                            size="1"
                            variant="ghost"
                            color="red"
                            title="Delete Document"
                            onClick={() => {
                              setDocToDelete(doc);
                              setDeleteDocModalOpen(true);
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', borderRadius: '4px' }}
                          >
                            <IconTrash />
                          </IconButton>
                        </Box>
                      </Flex>
                    )
                  })}
                  {(!ws.documents || ws.documents.length === 0) && (
                    <Text size="1" color="gray" style={{ fontStyle: 'italic', paddingLeft: '10px', paddingY: '4px', opacity: 0.6 }}>
                      No documents created
                    </Text>
                  )}
                </Box>

              </Box>
            ))}
          </Flex>
        </Box>

        {/* RIGHT WORKSPACE: LIVE SEAMLESS EDITOR SURFACE */}
        <Box p="6" style={{ overflowY: 'auto', background: 'var(--color-surface)' }}>
          {activeDocument ? (
            <Flex direction="column" gap="4" style={{ maxWidth: '820px', margin: '0 auto' }}>
              
              <Flex align="center" gap="2">
                <Text size="1" weight="bold" color="gray" style={{ letterSpacing: '0.4px', textTransform: 'uppercase', fontSize: '9px' }}>Workspace Document Pool</Text>
                <Box style={{ color: 'var(--gray-6)' }}><IconBullet /></Box>
                <Text size="1" color="blue" weight="medium">Cloud Storage Synced</Text>
              </Flex>

              <input 
                type="text" 
                value={activeDocument.title}
                onChange={(e) => handleTitleSync(e.target.value)}
                placeholder="Untitled Document Reference"
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '32px', fontWeight: '700', color: 'var(--gray-12)', letterSpacing: '-0.6px', padding: '0' }}
              />

              <Separator size="4" my="1" style={{ opacity: 0.3 }} />

              <Box style={{ margin: '0 -15px' }}>
                <style>{`
                  .ql-toolbar.ql-snow {
                    border: none !important;
                    background: transparent !important;
                    padding: 8px 12px !important;
                    border-bottom: 1px solid var(--gray-3) !important;
                    margin-bottom: 12px;
                  }
                  .ql-container.ql-snow {
                    border: none !important;
                  }
                  .ql-editor {
                    padding: 0 16px !important;
                    font-size: 15px !important;
                    line-height: 1.7 !important;
                    color: var(--gray-12) !important;
                  }
                  .ql-editor.ql-blank::before {
                    left: 16px !important;
                    font-style: normal !important;
                    color: var(--gray-7) !important;
                  }
                `}</style>
                
                <ReactQuill 
                  theme="snow"
                  value={activeDocument.body}
                  onChange={handleEditorBodySync}
                  modules={modules}
                  formats={formats}
                  placeholder="Start drafting component rules or press return for layout blocks..."
                  style={{
                    fontFamily: 'inherit'
                  }}
                />
              </Box>

              <Flex justify="between" align="center" mt="5" style={{ borderTop: '1px solid var(--gray-3)', paddingTop: '12px' }}>
                <Text size="1" color="gray">System State: <code style={{ fontFamily: 'monospace', color: 'var(--blue-11)' }}>active_sync_pool</code></Text>
              </Flex>

            </Flex>
          ) : (
            <Flex direction="column" align="center" justify="center" style={{ height: '60vh', color: 'var(--gray-8)', textAlign: 'center' }}>
              <IconDoc />
              <Text size="2" weight="medium" style={{ marginTop: '8px', color: 'var(--gray-12)' }}>No Workspace Selected</Text>
            </Flex>
          )}
        </Box>

      </Grid>

      {/* RADIX THEMES MODAL DIALOG: CREATE NEW SPACE */}
      <Dialog.Root open={spaceModalOpen} onOpenChange={setSpaceModalOpen}>
        <Dialog.Content style={{ maxWidth: 400, borderRadius: '12px' }}>
          <Dialog.Title><Heading size="4">Create New Space</Heading></Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Enter a name to initialize a brand new isolated workspace partition.
          </Dialog.Description>

          <Flex direction="column" gap="3" mb="4">
            <label>
              <Text size="1" weight="bold" color="gray" mb="1" style={{ display: 'block' }}>Space Name</Text>
              <TextField.Root 
                placeholder="e.g., Product Management" 
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
              />
            </label>
          </Flex>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleCreateWorkspaceSubmit} color="blue" disabled={!newSpaceName.trim()}>
              Create Space
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* RADIX THEMES MODAL DIALOG: CREATE NEW WORKSPACE MODEL */}
      <Dialog.Root open={modelModalOpen} onOpenChange={setModelModalOpen}>
        <Dialog.Content style={{ maxWidth: 400, borderRadius: '12px' }}>
          <Dialog.Title><Heading size="4">Create Workspace Model Spec</Heading></Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Initialize a new structured automation model blueprint context file.
          </Dialog.Description>

          <Flex direction="column" gap="3" mb="4">
            <label>
              <Text size="1" weight="bold" color="gray" mb="1" style={{ display: 'block' }}>Model Blueprint Name</Text>
              <TextField.Root 
                placeholder="e.g., User Authentication Model" 
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
              />
            </label>
          </Flex>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleAddWorkspaceModelSubmit} color="blue" disabled={!newModelName.trim()}>
              Generate Model
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* RADIX THEMES MODAL DIALOG: CONFIRM DELETE WORKSPACE */}
      <Dialog.Root open={deleteWorkspaceModalOpen} onOpenChange={setDeleteWorkspaceModalOpen}>
        <Dialog.Content style={{ maxWidth: 420, borderRadius: '12px' }}>
          <Dialog.Title><Heading size="4" color="red">Delete Workspace Space?</Heading></Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Are you sure you want to delete <strong>{workspaceToDelete?.name}</strong>? This structural pipeline action is permanent and will **immediately purge all child documentation logs and specifications** mapped inside it.
          </Dialog.Description>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel Action</Button>
            </Dialog.Close>
            <Button onClick={handleDeleteWorkspaceSubmit} color="red" variant="solid">
              Confirm Permanent Purge
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/*  RADIX THEMES MODAL DIALOG: CONFIRM DELETE DOCUMENT */}
      <Dialog.Root open={deleteDocModalOpen} onOpenChange={setDeleteDocModalOpen}>
        <Dialog.Content style={{ maxWidth: 400, borderRadius: '12px' }}>
          <Dialog.Title><Heading size="4" color="red">Delete Document?</Heading></Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Are you sure you want to permanently discard <strong>{docToDelete?.title || 'this document'}</strong>? This operation cannot be undone.
          </Dialog.Description>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleDeleteDocumentSubmit} color="red" variant="solid">
              Delete Document
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

    </Box>
  )
}