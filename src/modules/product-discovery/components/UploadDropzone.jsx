import React, { useRef, useState } from 'react'
import { Box, Flex, Text, IconButton } from '@radix-ui/themes'
import { UploadIcon, Cross2Icon, FileTextIcon } from '@radix-ui/react-icons'

export function UploadDropzone({ attachedFiles, onFilesAdded, onFileRemoved }) {
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

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFilesAdded(Array.from(e.target.files))
    }
  }

  const triggerBrowse = () => {
    fileInputRef.current?.click()
  }

  return (
    <Box className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
        accept=".pdf,.doc,.docx,.txt,.md,.csv,.json"
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        className={`w-full py-6 px-4 border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/40'
        }`}
      >
        <Flex direction="column" align="center" gap="2" className="text-center">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400">
            <UploadIcon width="18" height="18" />
          </div>
          <Text size="2" weight="medium" className="text-zinc-300">
            Drag & drop files here, or <span className="text-blue-400 font-semibold">browse</span>
          </Text>
          <Text size="1" color="gray">
            Supports PDF, DOCX, TXT, MD, CSV, JSON
          </Text>
        </Flex>
      </div>

      {attachedFiles.length > 0 && (
        <Flex direction="column" gap="1" className="mt-3">
          {attachedFiles.map((file, idx) => (
            <Flex
              key={`${file.name}-${idx}`}
              align="center"
              justify="between"
              px="3"
              py="2"
              className="bg-zinc-900/40 border border-zinc-900 rounded-lg hover:border-zinc-800 transition"
            >
              <Flex align="center" gap="2" className="min-w-0">
                <FileTextIcon className="text-zinc-500 flex-shrink-0" />
                <Text size="2" weight="medium" className="truncate text-zinc-300">
                  {file.name}
                </Text>
                <Text size="1" color="gray" className="flex-shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </Text>
              </Flex>
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                onClick={(e) => {
                  e.stopPropagation()
                  onFileRemoved(idx)
                }}
                className="hover:bg-zinc-800 rounded-full"
              >
                <Cross2Icon width="12" height="12" />
              </IconButton>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  )
}
