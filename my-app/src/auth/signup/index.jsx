import { SignUp } from '@clerk/react-router'

function SignUpPage() {
  return (
    <div className="flex justify-center py-8">
      <SignUp
        routing="path"
        path="/auth/sign-up"
        signInUrl="/auth/sign-in"
        forceRedirectUrl="/home"
      />
    </div>
  )
}

export default SignUpPage
