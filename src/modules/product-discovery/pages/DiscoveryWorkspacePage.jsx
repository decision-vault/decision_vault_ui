import React, { useState } from 'react'
import { Box, Flex, Grid, ScrollArea, Text, Card, Button, Heading } from '@radix-ui/themes'
import { ArrowLeftIcon, CheckIcon } from '@radix-ui/react-icons'
import { DiscoveryProvider, useDiscovery } from '../state/discoveryStore'
import { useProductDiscovery } from '../hooks/useProductDiscovery'
import { DiscoveryHero } from '../components/DiscoveryHero'
import { ProductIdeaCard } from '../components/ProductIdeaCard'
import { ProductTypeSelector } from '../components/ProductTypeSelector'
import { FeatureSelector } from '../components/FeatureSelector'
import { AIAssistantPanel } from '../components/AIAssistantPanel'
import { DiscoveryMarketingBlock } from '../components/DiscoveryMarketingBlock'
import { DiscoveryAdventureBlock } from '../components/DiscoveryAdventureBlock'
import { RecentChatsList } from '../components/RecentChatsList'

function DiscoveryWorkspaceInner() {
  const [step, setStep] = useState(1) // 1: Input text area, 2: Refinement options
  const [projectName, setProjectName] = useState('')

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
    draftSaved,
  } = useDiscovery()

  const {
    charCount,
    isTextValid,
    validationWarning,
    aiSuggestions,
    examplePrompts,
    applyExamplePrompt,
    handleSaveDraft,
    handleStep1Submit,
    handleFinalSubmit,
  } = useProductDiscovery()

  const [errorMsg, setErrorMsg] = useState('')

  const handleStep1Continue = async () => {
    if (isTextValid) {
      try {
        setErrorMsg('')
        await handleStep1Submit()
        setStep(2)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'An error occurred while creating project draft')
      }
    }
  }

  const handleFinalSubmitAction = async () => {
    setErrorMsg('')
    try {
      await handleFinalSubmit(projectName)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred during project creation')
    }
  }

  return (
    <ScrollArea type="auto" scrollbars="vertical" className="h-full w-full">
      <Box
        p={{ initial: '4', md: '6' }}
        className="min-h-full"
        style={{
          background:
            'radial-gradient(1200px 500px at 10% -10%, rgba(59,130,246,0.08), transparent 45%), radial-gradient(900px 500px at 90% -10%, rgba(59,130,246,0.06), transparent 45%)',
        }}
      >
        {/* Error alerts */}
        {errorMsg && (
          <Box className="max-w-[768px] mx-auto mb-4 border border-red-500/30 bg-red-500/5 text-red-400 text-sm rounded-xl p-3 animate-fadeIn">
            {errorMsg}
          </Box>
        )}

        {step === 1 && (
          /* STEP 1: Centered input workspace */
          <Box className="max-w-[768px] mx-auto w-full flex flex-col justify-center py-8 min-h-[70vh] animate-fadeIn">
            <DiscoveryHero />
            
            <ProductIdeaCard
              ideaText={ideaText}
              setIdeaText={setIdeaText}
              attachedFiles={attachedFiles}
              onFilesAdded={addFiles}
              onFileRemoved={removeFile}
              charCount={charCount}
              isTextValid={isTextValid}
              validationWarning={validationWarning}
              onSaveDraft={handleSaveDraft}
              onContinue={handleStep1Continue}
              isSubmitting={isSubmitting}
              draftSaved={draftSaved}
            />

            <RecentChatsList />

            <DiscoveryMarketingBlock />
            <DiscoveryAdventureBlock />
          </Box>
        )}

        {step === 2 && (
          /* STEP 2: Product Type Selection ONLY (Centered, details card hidden) */
          <Box className="max-w-[768px] mx-auto w-full flex flex-col justify-center py-8 min-h-[70vh] animate-fadeIn">
            <Box className="text-center mb-8">
              <Text size="1" color="blue" weight="bold" className="uppercase tracking-wider">
                Discovery Step 2
              </Text>
              <Heading size="7" className="text-white font-extrabold mt-2 leading-tight">
                What type of product are you building?
              </Heading>
              <Text size="2" color="gray" className="mt-2 block max-w-md mx-auto">
                Select one or more categories that describe your workspace. This sets up the default framework for your project.
              </Text>
            </Box>

            <Card
              size="3"
              className="dv-card bg-zinc-950/20 border border-zinc-800 rounded-3xl p-6 mb-6"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              <ProductTypeSelector
                selectedTypes={selectedTypes}
                onToggleType={toggleProductType}
              />
            </Card>

            <Flex justify="between" align="center" className="px-4">
              <Button
                variant="ghost"
                color="gray"
                size="2"
                onClick={() => setStep(1)}
                className="rounded-full text-zinc-400 hover:text-white cursor-pointer px-4 py-2 transition-colors duration-300"
              >
                <ArrowLeftIcon className="mr-1.5" /> Back to description
              </Button>

              <Button
                disabled={selectedTypes.length === 0}
                onClick={() => setStep(3)}
                className={`rounded-full font-bold px-6 py-2.5 transition-all duration-300 ${
                  selectedTypes.length > 0
                    ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:scale-[1.02]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                Continue to Features
              </Button>
            </Flex>
          </Box>
        )}

        {step === 3 && (
          /* STEP 3: Features Selection & Final workspace generation (Centered) */
          <Box className="max-w-[768px] mx-auto w-full flex flex-col justify-center py-8 min-h-[70vh] animate-fadeIn">
            <Box className="text-center mb-8">
              <Text size="1" color="blue" weight="bold" className="uppercase tracking-wider">
                Discovery Step 3
              </Text>
              <Heading size="7" className="text-white font-extrabold mt-2 leading-tight">
                Select the specific features
              </Heading>
              <Text size="2" color="gray" className="mt-2 block max-w-md mx-auto">
                Choose the custom integrations, database layers, and access patterns to enable in your workspace.
              </Text>
            </Box>

            <FeatureSelector
              selectedFeatures={selectedFeatures}
              onToggleFeature={toggleFeature}
            />

            <Flex justify="between" align="center" className="mt-8 px-4">
              <Button
                variant="ghost"
                color="gray"
                size="2"
                onClick={() => setStep(2)}
                className="rounded-full text-zinc-400 hover:text-white cursor-pointer px-4 py-2 transition-colors duration-300"
              >
                <ArrowLeftIcon className="mr-1.5" /> Back to product type
              </Button>

              <Button
                onClick={handleFinalSubmitAction}
                disabled={isSubmitting}
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:scale-[1.02] cursor-pointer transition-all duration-300 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  'Generating Workspace...'
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Generate Workspace
                  </>
                )}
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </ScrollArea>
  )
}

export function DiscoveryWorkspacePage() {
  return (
    <DiscoveryProvider>
      <DiscoveryWorkspaceInner />
    </DiscoveryProvider>
  )
}
export default DiscoveryWorkspacePage
