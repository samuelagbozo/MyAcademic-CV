import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@clerk/react-router'

function App() {
  return <AppLayout />
}

function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) return <p className="p-6">Loading...</p>
  if ((['/home', '/dashboard', '/resumes', '/reviews', '/resume-rating'].includes(location.pathname) ||
    location.pathname.startsWith('/resume-rating/') ||
    location.pathname.startsWith('/builder/')) && !isSignedIn) {
    return <Navigate to="/auth/sign-in" replace />
  }

  return <Outlet />
}

export default App
