import { lazy } from 'react'

const LoginPage = lazy(() => import('./auth/login'))
const SignUpPage = lazy(() => import('./auth/signup'))
const Home = lazy(() => import('./Home'))
const Dashboard = lazy(() => import('./dashboard'))
const Welcome = lazy(() => import('./Welcome'))
const Builder = lazy(() => import('./builder'))
const ResumeRating = lazy(() => import('./ResumeRating.jsx'))
const ResumeHistory = lazy(() => import('./ResumeHistory.jsx'))
const AIReviewHistory = lazy(() => import('./AIReviewHistory.jsx'))
const PublicCv = lazy(() => import('./PublicCv.jsx'))

export {
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
}
