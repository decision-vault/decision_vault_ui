import { useSyncExternalStore } from 'react'
import { Theme } from '@radix-ui/themes'

function subscribe(callback) {
  const m = window.matchMedia('(prefers-color-scheme: dark)')
  m.addEventListener('change', callback)
  return () => m.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getServerSnapshot() {
  return false
}

export function SystemTheme({ children }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return (
    <Theme
      appearance={isDark ? 'dark' : 'light'}
      accentColor="green"
      grayColor="slate"
      radius="medium"
    >
      {children}
    </Theme>
  )
}
