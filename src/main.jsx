import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@radix-ui/themes/styles.css'
import './index.css'
import App from './App.jsx'
import { SystemTheme } from './components/SystemTheme.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SystemTheme>
        <App />
      </SystemTheme>
    </AuthProvider>
  </StrictMode>,
)
