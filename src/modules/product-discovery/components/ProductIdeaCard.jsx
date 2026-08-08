import React, { useState, useRef } from 'react'
import { Box, Flex, Text } from '@radix-ui/themes'

export function ProductIdeaCard({
  ideaText,
  setIdeaText,
  attachedFiles,
  onFilesAdded,
  onFileRemoved,
  charCount,
  isTextValid,
  validationWarning,
  onSaveDraft,
  onContinue,
  isSubmitting,
  draftSaved,
}) {
  const fileInputRef = useRef(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFilesAdded(Array.from(e.dataTransfer.files))
    }
  }

  const handlePlusClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFilesAdded(Array.from(e.target.files))
    }
  }

  const handleTelescopeClick = () => {
    setIdeaText(
      "Build a mobile health application that links patients with local primary care doctors. Patients can book online consultations, receive digital prescriptions securely, request automated refills, track their vitals (heart rate, sleep quality) via Apple Health integrations, and ask questions to an AI chatbot for general wellness guidance."
    )
  }

  const handleBulbClick = () => {
    const templates = [
      "Create an AI-powered financial management dashboard for small businesses. The app will sync with bank feeds, categorize invoices automatically using ML models, predict cash flow for the next 90 days, suggest cost-saving opportunities, and auto-generate tax filings for owners.",
      "Design a real-time collaborative workspace for remote film editors. It needs multi-track timelines, cloud rendering queues, timeline frame-by-frame commenting, asset version controls, and integrated Slack/Teams video review hooks.",
      "Build a decentralized B2B agricultural marketplace connecting small farmers directly to wholesale markets. Features SMS-based trading terminals, automated price index calculations, cooperative logistics coordination, and Stripe invoicing."
    ]
    const rand = templates[Math.floor(Math.random() * templates.length)]
    setIdeaText(rand)
  }

  return (
    <Box className="w-full select-none">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
        accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.png,.jpg,.jpeg"
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full transition-all duration-300 border rounded-[32px] bg-white dark:bg-zinc-900/60 p-5 flex flex-col gap-4 relative ${
          isDragActive
            ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.08)] bg-blue-50/10'
            : 'border-zinc-200/80 dark:border-zinc-800/80 focus-within:border-zinc-300/80 dark:focus-within:border-zinc-700/80 shadow-[0_12px_45px_rgba(0,0,0,0.03)]'
        }`}
      >
        {/* Sparkle pencil edit icon in the top right */}
        <div className="absolute top-5 right-6 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer transition-colors">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>

        {/* Attached Files pills (inside at the top, matching the screenshot) */}
        {attachedFiles.length > 0 && (
          <Flex wrap="wrap" gap="2.5" className="pt-1 pr-10">
            {attachedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
              >
                {/* Tiny image preview or file icon */}
                {file.type?.startsWith('image/') ? (
                  <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">{file.name}</span>
                <div
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFileRemoved(idx)
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition cursor-pointer p-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            ))}
          </Flex>
        )}

        {/* Main Textarea */}
        <textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder="Describe your product idea, users, workflows, problems, and goals..."
          className="w-full bg-transparent border-0 resize-none outline-none focus:ring-0 text-[15px] text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 min-h-[110px] pr-8 pl-1 font-sans leading-relaxed"
          maxLength={5000}
          disabled={isSubmitting}
        />

        {/* Action Row */}
        <Flex justify="between" align="center" className="pt-2 border-t border-zinc-100 dark:border-zinc-900/40">
          {/* Left Actions */}
          <Flex align="center" gap="3">
            {/* Plus Icon */}
            <div
              role="button"
              onClick={handlePlusClick}
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer p-1.5 transition-colors"
              title="Attach File"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>

            {/* Separator line */}
            <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />

            {/* Lightbulb Prompt icon */}
            <div
              role="button"
              onClick={handleBulbClick}
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer p-1.5 transition-colors"
              title="Prefill templates"
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 3.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 3.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </div>

            {/* Telescope Notes icon */}
            <div
              role="button"
              onClick={handleTelescopeClick}
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer p-1.5 transition-colors"
              title="Import demo notes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.5 12.5l5.5-5.5M16 7l2-2 1.5 1.5-2 2-1.5-1.5z" />
                <path d="M12 12v5m0 0l-3 4m3-4l3 4" />
              </svg>
            </div>

            {/* Search Globe icon */}
            <div
              role="button"
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer p-1.5 transition-colors"
              title="Search Web"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35M11 7a4 4 0 00-4 4" />
              </svg>
            </div>
          </Flex>

          {/* Right Actions */}
          <Flex align="center" gap="3">
            {/* Save draft action (Target Shield Icon) */}
            <div
              role="button"
              onClick={onSaveDraft}
              className={`cursor-pointer p-1.5 transition-colors ${
                draftSaved ? 'text-blue-500' : 'text-zinc-400 hover:text-zinc-600'
              }`}
              title="Save draft"
            >
              {draftSaved ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              )}
            </div>

            {/* Microphone icon */}
            <div
              role="button"
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer p-1.5 transition-colors"
              title="Voice Input (Placeholder)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="3" width="6" height="10" rx="3" />
                <path d="M19 10v1a7 7 0 01-14 0v-1M12 18v4M8 22h8" />
              </svg>
            </div>

            {/* Circular Continue Submit button with Arrow Up */}
            <div
              role="button"
              disabled={!isTextValid || isSubmitting}
              onClick={isTextValid && !isSubmitting ? onContinue : undefined}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isTextValid
                  ? 'bg-[#1e293b] hover:bg-[#0f172a] text-white cursor-pointer scale-100 hover:scale-105'
                  : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
              }`}
              title="Continue"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </div>
          </Flex>
        </Flex>
      </div>

      {/* Character count & warnings */}
      <Flex justify="between" className="mt-2.5 px-4">
        <div>
          {validationWarning ? (
            <Text size="1" color="amber" className="font-semibold animate-pulse block">
              {validationWarning}
            </Text>
          ) : charCount >= 300 ? (
            <Flex align="center" gap="1">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <Text size="1" color="blue" className="font-bold">
                Idea detailed successfully. Ready to proceed.
              </Text>
            </Flex>
          ) : null}
        </div>
        <Text
          size="1"
          className={isTextValid ? 'text-blue-600 dark:text-blue-500 font-semibold' : 'text-zinc-400 dark:text-zinc-500'}
        >
          {charCount} / 300 min characters
        </Text>
      </Flex>
    </Box>
  )
}
