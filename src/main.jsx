import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@radix-ui/themes/styles.css'
import './index.css'
import App from './App.jsx'
import { SystemTheme } from './components/SystemTheme.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SystemTheme>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SystemTheme>
    </AuthProvider>
  </StrictMode>,
)
