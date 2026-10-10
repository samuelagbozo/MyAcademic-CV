import { SignIn } from '@clerk/react-router'
import { useLocation } from 'react-router'
import AuthPageLayout from '../AuthPageLayout.jsx'

function LoginPage() {
  const { state } = useLocation()
  return (
    <AuthPageLayout mode="sign-in">
      {state?.sessionExpired && <p role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Your session expired. Sign in again to continue to your workspace.</p>}
      <SignIn
        routing="path"
        path="/auth/sign-in"
        signUpUrl="/auth/sign-up"
        forceRedirectUrl="/home"
      />
    </AuthPageLayout>
  )
}

export default LoginPage
