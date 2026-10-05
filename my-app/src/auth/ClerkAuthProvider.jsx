import { ClerkProvider } from '@clerk/react-router'
import { shadcn } from '@clerk/ui/themes'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function ClerkAuthProvider({ children }) {
  if (!publishableKey) {
    throw new Error('Add VITE_CLERK_PUBLISHABLE_KEY to .env.local, then restart the dev server.')
  }

  return (
    <ClerkProvider publishableKey={publishableKey} appearance={{ theme: shadcn }}>
      {children}
    </ClerkProvider>
  )
}

export default ClerkAuthProvider
