import { Outlet } from 'react-router-dom'
import { Box } from '@radix-ui/themes'

export function AuthLayout() {
  return (
    <Box style={{ minHeight: '100vh' }}>
      <Outlet />
    </Box>
  )
}
