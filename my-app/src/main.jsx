import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ClerkRouteLayout from './ClerkRouteLayout.jsx'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import RouteLoading from './RouteLoading.jsx'
import {
  AIReviewHistory,
  Builder,
  Dashboard,
  Home,
  LoginPage,
  PublicCv,
  ResumeHistory,
  ResumeRating,
  SignUpPage,
  Welcome,
} from './routePages.js'

const router = createBrowserRouter([
  {
    element: <ClerkRouteLayout />,
    children: [
      {
        element: <App />,
        children: [
          {
            path: '/',
            element: <Suspense fallback={<RouteLoading label="Loading ResumeAI" />}><Welcome /></Suspense>,
          },
          {
            path: '/home',
            element: <Suspense fallback={<RouteLoading label="Loading your workspace" />}><Home /></Suspense>,
          },
          {
            path: '/resumes',
            element: <Suspense fallback={<RouteLoading label="Loading your resumes" />}><ResumeHistory /></Suspense>,
          },
          {
            path: '/reviews',
            element: <Suspense fallback={<RouteLoading label="Loading your AI reviews" />}><AIReviewHistory /></Suspense>,
          },
          {
            path: '/dashboard',
            element: <Suspense fallback={<RouteLoading label="Loading your dashboard" />}><Dashboard /></Suspense>,
          },
          {
            path: '/builder/:id',
            element: <Suspense fallback={<RouteLoading label="Loading your resume builder" />}><Builder /></Suspense>,
          },
          {
            path: '/cv/:id',
            element: <Suspense fallback={<RouteLoading label="Loading CV" />}><PublicCv /></Suspense>,
          },
          {
            path: '/resume-rating',
            element: <Suspense fallback={<RouteLoading label="Loading AI review" />}><ResumeRating /></Suspense>,
          },
          {
            path: '/resume-rating/:reviewId',
            element: <Suspense fallback={<RouteLoading label="Loading saved AI review" />}><ResumeRating /></Suspense>,
          },
        ],
      },
      {
        path: '/auth/sign-in/*',
        element: <Suspense fallback={<RouteLoading label="Loading sign in" />}><LoginPage /></Suspense>,
      },
      {
        path: '/auth/sign-up/*',
        element: <Suspense fallback={<RouteLoading label="Loading sign up" />}><SignUpPage /></Suspense>,
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
