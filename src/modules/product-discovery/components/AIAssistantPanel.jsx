import React from 'react'
import { Card, Flex, Text, Box } from '@radix-ui/themes'
import { MagicWandIcon, InfoCircledIcon, ChevronRightIcon } from '@radix-ui/react-icons'

export function AIAssistantPanel({
  ideaText,
  aiSuggestions,
  examplePrompts,
  onApplyPrompt,
  charCount,
  selectedTypesCount,
  selectedFeaturesCount
}) {
  // Compute idea completeness score
  const completenessScore = Math.min(
    100,
    (charCount >= 300 ? 50 : Math.round((charCount / 300) * 50)) +
    (selectedTypesCount > 0 ? 25 : 0) +
    (selectedFeaturesCount > 0 ? 25 : 0)
  )

  const getScoreColor = (score) => {
    if (score < 40) return 'bg-red-500'
    if (score < 80) return 'bg-amber-500'
    return 'bg-blue-500'
  }

  const getScoreText = (score) => {
    if (score < 40) return 'Drafting Idea'
    if (score < 80) return 'Developing Specs'
    return 'Production Ready'
  }

  return (
    <Card
      size="3"
      className="dv-card sticky top-4 border border-zinc-800 bg-zinc-950/20 backdrop-blur rounded-2xl p-5 flex flex-col gap-5 w-full max-h-[85vh] overflow-y-auto"
      style={{
        boxShadow: 'var(--shadow-glow)',
      }}
    >
      {/* Header Info */}
      <Flex direction="column" gap="1" className="border-b border-zinc-900 pb-3">
        <Flex align="center" gap="2" className="text-blue-400">
          <MagicWandIcon width="18" height="18" className="animate-spin" style={{ animationDuration: '4s' }} />
          <Text size="3" weight="bold" className="tracking-wide">
            AI Architect Assistant
          </Text>
        </Flex>
        <Text size="1" color="gray" className="mt-1">
          Real-time diagnostics and structural hints to refine your requirements.
        </Text>
      </Flex>

      {/* Idea Strength Indicator */}
      <Flex direction="column" gap="2" className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
        <Flex justify="between" align="center">
          <Text size="1" color="gray" className="uppercase tracking-wider font-semibold">
            Idea Completeness
          </Text>
          <Text size="1" color={completenessScore === 100 ? 'green' : completenessScore > 40 ? 'amber' : 'red'} className="font-bold">
            {getScoreText(completenessScore)}
          </Text>
        </Flex>
        <Flex align="center" gap="3">
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(completenessScore)}`}
              style={{ width: `${completenessScore}%` }}
            />
          </div>
          <Text size="2" weight="bold" className="text-zinc-300">
            {completenessScore}%
          </Text>
        </Flex>
      </Flex>

      {/* Real-time suggestions */}
      <Flex direction="column" gap="2">
        <Text size="1" color="gray" className="uppercase tracking-wider font-semibold px-1">
          Architect Recommendations
        </Text>
        <Flex direction="column" gap="2">
          {aiSuggestions.map((suggestion) => {
            const isWarning = suggestion.type === 'warning'
            const isSuccess = suggestion.type === 'success'

            return (
              <Flex
                key={suggestion.id}
                gap="3"
                p="3"
                className={`border rounded-xl transition duration-300 ${
                  isWarning
                    ? 'border-amber-900/50 bg-amber-500/5 text-amber-400'
                    : isSuccess
                    ? 'border-blue-900/50 bg-blue-500/5 text-blue-400'
                    : 'border-zinc-900 bg-zinc-950/40 text-zinc-300'
                }`}
              >
                <div className="mt-0.5">
                  <InfoCircledIcon />
                </div>
                <Flex direction="column" gap="0.5">
                  <Text size="2" weight="bold">
                    {suggestion.title}
                  </Text>
                  <p className="text-[11px] text-zinc-400 leading-relaxed m-0">
                    {suggestion.description}
                  </p>
                </Flex>
              </Flex>
            )
          })}
        </Flex>
      </Flex>

      {/* Example Prompts */}
      <Flex direction="column" gap="2" className="border-t border-zinc-900 pt-4">
        <Text size="1" color="gray" className="uppercase tracking-wider font-semibold px-1">
          Example Starters
        </Text>
        <Flex direction="column" gap="2">
          {examplePrompts.map((prompt) => (
            <div
              key={prompt.label}
              onClick={() => onApplyPrompt(prompt.text)}
              className="group border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900/20 cursor-pointer p-3 rounded-xl transition duration-300 flex align-center justify-between"
            >
              <Box className="min-w-0 pr-2">
                <Text size="2" weight="bold" className="text-zinc-200 group-hover:text-blue-400 transition-colors">
                  {prompt.label}
                </Text>
                <p className="text-[10px] text-zinc-500 truncate leading-relaxed mt-0.5 m-0">
                  {prompt.text}
                </p>
              </Box>
              <ChevronRightIcon className="text-zinc-600 group-hover:text-zinc-400 mt-1 flex-shrink-0" />
            </div>
          ))}
        </Flex>
      </Flex>
    </Card>
  )
}
