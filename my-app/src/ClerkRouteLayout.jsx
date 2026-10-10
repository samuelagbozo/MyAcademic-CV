import { Outlet } from 'react-router'
import ClerkAuthProvider from './auth/ClerkAuthProvider.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'

function ClerkRouteLayout() {
  return (
    <ThemeProvider>
      <ClerkAuthProvider>
        <Outlet />
      </ClerkAuthProvider>
    </ThemeProvider>
  )
}

export default ClerkRouteLayout
