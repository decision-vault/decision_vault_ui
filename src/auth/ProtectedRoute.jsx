import { Navigate, useLocation } from 'react-router-dom'
import { Box, Flex, Spinner } from '@radix-ui/themes'

import { useAuth } from './AuthContext'

export function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Box style={{ minHeight: '100vh' }}>
        <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
          <Spinner />
        </Flex>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Box style={{ minHeight: '100vh' }}>
        <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
          <Spinner />
        </Flex>
      </Box>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/organizations" replace />
  }

  return children
}

