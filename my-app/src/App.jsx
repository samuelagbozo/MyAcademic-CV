import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@clerk/react-router'
import NewtonsCradle from './components/ui/NewtonsCradle.jsx'

function App() {
  return <AppLayout />
}

function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()
  const isProtectedRoute = ['/home', '/dashboard', '/resumes', '/reviews', '/resume-rating'].includes(location.pathname)
    || location.pathname.startsWith('/resume-rating/')
    || location.pathname.startsWith('/builder/')

  if (!isProtectedRoute) return <Outlet />

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#F2EFE6] dark:bg-[#101812]" role="presentation">
        <NewtonsCradle label="Loading your workspace" className="min-h-screen" />
      </main>
    )
  }
  if (!isSignedIn) {
    return <Navigate to="/auth/sign-in" replace state={{ sessionExpired: true, returnTo: location.pathname }} />
  }

  return <Outlet />
}

export default App
