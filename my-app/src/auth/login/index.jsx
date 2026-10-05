import { SignIn } from '@clerk/react-router'

function LoginPage() {
  return (
    <div className="flex justify-center py-8">
      <SignIn
        routing="path"
        path="/auth/sign-in"
        signUpUrl="/auth/sign-up"
        forceRedirectUrl="/home"
      />
    </div>
  )
}

export default LoginPage
