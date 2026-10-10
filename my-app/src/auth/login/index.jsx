import { SignIn } from '@clerk/react-router'
import AuthPageLayout from '../AuthPageLayout.jsx'

function LoginPage() {
  return (
    <AuthPageLayout mode="sign-in">
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
