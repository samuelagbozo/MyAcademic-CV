import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ClerkAuthProvider from './auth/ClerkAuthProvider.jsx'
import { createBrowserRouter, Outlet } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import LoginPage from './auth/login'
import SignUpPage from './auth/signup'
import Home from './Home'
import Dashboard from './dashboard'
import Welcome from './Welcome'
import Builder from './builder'
import ResumeRating from './ResumeRating.jsx'
import ResumeHistory from './ResumeHistory.jsx'
import AIReviewHistory from './AIReviewHistory.jsx'

const router = createBrowserRouter([
  {
    element: <ClerkRouteLayout />,
    children: [
      {
        element: <App />,
        children: [
          {
            path: '/',
            element: <Welcome />,
          },
          {
            path: '/home',
            element: <Home />,
          },
          {
            path: '/resumes',
            element: <ResumeHistory />,
          },
          {
            path: '/reviews',
            element: <AIReviewHistory />,
          },
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/builder/:id',
            element: <Builder />,
          },
          {
            path: '/resume-rating',
            element: <ResumeRating />,
          },
          {
            path: '/resume-rating/:reviewId',
            element: <ResumeRating />,
          },
        ],
      },
      {
        path: '/auth/sign-in/*',
        element: <LoginPage />,
      },
      {
        path: '/auth/sign-up/*',
        element: <SignUpPage />,
      },
    ],
  },
])

function ClerkRouteLayout() {
  return (
    <ClerkAuthProvider>
      <Outlet />
    </ClerkAuthProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
