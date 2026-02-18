import { useEffect, useRef } from 'react'
import { marked } from 'marked'
import TurndownService from 'turndown'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })

export function QuillMarkdownEditor({ value = '', onChange, placeholder, style = {} }) {
  const containerRef = useRef(null)
  const quillRef = useRef(null)
  const isInitializingRef = useRef(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const quill = new Quill(el, {
      theme: 'snow',
      placeholder: placeholder ?? 'Write your document...',
    })
    quillRef.current = quill

    // Set initial content: markdown -> HTML
    const html = value.trim() ? marked.parse(value, { async: false }) : ''
    quill.root.innerHTML = html || '<p><br></p>'
    isInitializingRef.current = true

    const handler = () => {
      if (isInitializingRef.current) {
        isInitializingRef.current = false
        return
      }
      const html = quill.root.innerHTML
      const md = turndown.turndown(html || '')
      onChange?.(md)
    }

    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
      quillRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- mount once

  // When value changes externally (e.g. reset), update Quill if it's not the same as current
  useEffect(() => {
    const quill = quillRef.current
    if (!quill || isInitializingRef.current) return
    const currentHtml = quill.root.innerHTML
    const expectedHtml = value.trim() ? marked.parse(value, { async: false }) : ''
    if (currentHtml !== expectedHtml && expectedHtml !== '') {
      isInitializingRef.current = true
      quill.root.innerHTML = expectedHtml || '<p><br></p>'
      setTimeout(() => { isInitializingRef.current = false }, 0)
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: 'calc(100vh - 180px)',
        background: 'var(--color-background)',
        ...style,
      }}
    />
  )
}
