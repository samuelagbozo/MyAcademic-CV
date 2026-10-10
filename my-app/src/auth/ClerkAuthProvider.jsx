import { ClerkProvider } from '@clerk/react-router'
import { shadcn } from '@clerk/ui/themes'
import useTheme from '../theme/useTheme.js'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function ClerkAuthProvider({ children }) {
  const { isDark } = useTheme()
  if (!publishableKey) {
    throw new Error('Add VITE_CLERK_PUBLISHABLE_KEY to .env.local, then restart the dev server.')
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        theme: shadcn,
        variables: {
          colorPrimary: '#C5F26E',
          colorBackground: isDark ? '#1A241D' : '#FFFEFA',
          colorForeground: isDark ? '#F2EFE6' : '#1B342B',
          colorInput: isDark ? 'rgba(242, 239, 230, 0.22)' : 'rgba(44, 74, 62, 0.22)',
          colorInputForeground: isDark ? '#F2EFE6' : '#1B342B',
          colorNeutral: isDark ? '#F2EFE6' : '#1B342B',
          colorMuted: isDark ? '#27362B' : '#F2EFE6',
          colorMutedForeground: isDark ? '#B1BFB2' : '#647168',
          colorRing: isDark ? '#C5F26E' : '#83AE40',
          borderRadius: '0.75rem',
          fontFamily: '"Geist Variable", sans-serif',
        },
        options: {
          elevation: 'raised',
          socialButtonsPlacement: 'top',
        },
        elements: {
          rootBox: 'clerk-auth-root',
          cardBox: 'clerk-auth-cardbox',
          card: 'clerk-auth-card',
          headerTitle: 'clerk-auth-title',
          headerSubtitle: 'clerk-auth-subtitle',
          formFieldInput: 'clerk-auth-input',
          formFieldAction: 'clerk-auth-field-action',
          formButtonPrimary: 'clerk-auth-submit',
          socialButtonsBlockButton: 'clerk-auth-social',
          dividerLine: 'clerk-auth-divider-line',
          dividerText: 'clerk-auth-divider-text',
          footerActionText: 'clerk-auth-footer-text',
          footerActionLink: 'clerk-auth-footer-link',
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}

export default ClerkAuthProvider
