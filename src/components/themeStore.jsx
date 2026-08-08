import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'dv_theme_mode'

function getSystemDark() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function resolveAppearance(mode) {
  if (mode === 'Dark' || mode === 'Classic Dark') return 'dark'
  if (mode === 'Light') return 'light'
  return getSystemDark() ? 'dark' : 'light'
}

const ThemeContext = createContext({ mode: 'System', setMode: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'System'
    } catch {
      return 'System'
    }
  })

  const [systemDark, setSystemDark] = useState(getSystemDark)

  // Follow OS preference changes so "System" mode stays live
  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(m.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])

  const appearance = useMemo(() => {
    if (mode === 'Dark' || mode === 'Classic Dark') return 'dark'
    if (mode === 'Light') return 'light'
    return systemDark ? 'dark' : 'light'
  }, [mode, systemDark])

  // Sync the html.dark class + localStorage
  useEffect(() => {
    const isDark = appearance === 'dark'
    try {
      document.documentElement.classList.toggle('dark', isDark)
      localStorage.setItem(THEME_KEY, mode)
    } catch {
      // ignore
    }
  }, [appearance, mode])

  const value = useMemo(() => ({ mode, setMode, appearance }), [mode, appearance])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function SystemTheme({ children }) {
  const { mode, setMode, appearance } = useTheme()
  try {
    document.documentElement.classList.toggle('dark', appearance === 'dark')
  } catch {
    // ignore
  }
  return (
    <Theme
      appearance={appearance}
      accentColor="blue"
      grayColor="slate"
      radius="medium"
    >
      {children}
    </Theme>
  )
}

// Convenience: expose a hook + shared theme option list for all switchers
export const THEME_OPTIONS = ['System', 'Dark', 'Light']
