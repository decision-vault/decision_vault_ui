import React from 'react'
import { Box, Flex, Grid, Heading, Text, Badge } from '@radix-ui/themes'
import { useDiscovery } from '../state/discoveryStore'

export function RecentChatsList() {
  const { recentChats, loadRecentChat, deleteRecentChat, ideaText } = useDiscovery()

  if (!recentChats || recentChats.length === 0) {
    return null
  }

  return (
    <Box className="w-full mt-10 select-none animate-fadeIn">
      {/* List Header */}
      <Flex align="center" justify="between" className="mb-4">
        <Flex align="center" gap="2">
          <Text size="2" weight="bold" color="gray" className="uppercase tracking-wider">
            Recent Product Discoveries
          </Text>
          <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
            {recentChats.length}
          </span>
        </Flex>
        {recentChats.length > 2 && (
          <Text size="1" color="gray" className="text-zinc-500 italic">
            Click to reload draft
          </Text>
        )}
      </Flex>

      {/* Grid of Recent Chats */}
      <Grid columns={{ initial: '1', sm: '2' }} gap="4">
        {recentChats.map((chat) => {
          // Check if this chat is currently active in the textarea
          const isActive = ideaText.trim() === chat.ideaText.trim()
          
          return (
            <div
              key={chat.id}
              onClick={() => loadRecentChat(chat)}
              className={`group relative border rounded-2xl p-4 flex flex-col justify-between min-h-[125px] cursor-pointer transition-all duration-300 ${
                isActive
                  ? 'border-blue-500/80 bg-blue-950/10 shadow-[0_4px_20px_rgba(59,130,246,0.1)]'
                  : 'border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/20 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/40 hover:scale-[1.01] hover:shadow-soft'
              }`}
            >
              {/* Close/Delete Button (Top Right) */}
              <div
                role="button"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteRecentChat(chat.id)
                }}
                className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 p-1 cursor-pointer rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors z-10"
                title="Remove from history"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              {/* Top part: Icon, Title & Badge */}
              <Flex direction="column" gap="1" className="pr-6">
                <Flex align="center" gap="2">
                  {/* Small Chatbubble SVG */}
                  <div className={`flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  
                  <Heading
                    size="2"
                    className={`font-bold truncate max-w-[170px] ${
                      isActive ? 'text-blue-600 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {chat.title}
                  </Heading>

                  <Badge
                    size="1"
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                      chat.status === 'Completed'
                        ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {chat.status}
                  </Badge>
                </Flex>

                {/* Excerpt Snippet */}
                <Text size="1" color="gray" className="mt-1 line-clamp-2 text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  {chat.ideaText}
                </Text>
              </Flex>

              {/* Bottom part: Categories & Timestamp */}
              <Flex align="center" justify="between" className="mt-3.5 pt-2 border-t border-zinc-100 dark:border-zinc-900/40 text-[10px]">
                {/* Meta Summary (e.g. types/features counted) */}
                <Text color="gray" className="text-zinc-400 dark:text-zinc-500 font-medium">
                  {chat.selectedTypes?.length > 0
                    ? `${chat.selectedTypes.length} types • ${chat.selectedFeatures?.length || 0} features`
                    : 'No configuration selections'}
                </Text>

                {/* Time Indicator */}
                <Text color="gray" className="text-zinc-400 dark:text-zinc-500">
                  {chat.timestamp}
                </Text>
              </Flex>
            </div>
          )
        })}
      </Grid>
    </Box>
  )
}
