import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

let toastId = 0

function ToastItem({ toast, onDismiss }) {
  const isSuccess = toast.type === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        width: '340px',
        padding: '12px 14px',
        borderRadius: '10px',
        border: `1px solid ${isSuccess ? 'var(--green-6)' : 'var(--red-6)'}`,
        backgroundColor: 'var(--color-panel-solid)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        animation: 'dv-toast-in 0.2s ease',
      }}
      role="status"
    >
      <Icon
        size={18}
        style={{
          flexShrink: 0,
          marginTop: 1,
          color: isSuccess ? 'var(--green-9)' : 'var(--red-9)',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: isSuccess ? 'var(--green-11)' : 'var(--red-11)',
          }}
        >
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: '12px', color: 'var(--gray-11)', marginTop: '2px' }}>{toast.message}</div>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: '2px',
          color: 'var(--gray-9)',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (type, title, message, duration = 4000) => {
      const id = ++toastId
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message }])
      const timer = setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
    },
    [dismiss]
  )

  const api = useMemo(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message, 6000),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
      <style>{`
        @keyframes dv-toast-in {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }
  return context
}
