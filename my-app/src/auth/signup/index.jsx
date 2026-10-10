import { SignUp } from '@clerk/react-router'
import AuthPageLayout from '../AuthPageLayout.jsx'

function SignUpPage() {
  return (
    <AuthPageLayout mode="sign-up">
      <SignUp
        routing="path"
        path="/auth/sign-up"
        signInUrl="/auth/sign-in"
        forceRedirectUrl="/home"
      />
    </AuthPageLayout>
  )
}

export default SignUpPage
