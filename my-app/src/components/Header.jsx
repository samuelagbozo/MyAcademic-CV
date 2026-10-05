import { Link } from 'react-router'
import { UserButton } from '@clerk/react-router'

function Header({ action }) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link
        to="/"
        aria-label="Go to welcome page"
        className="flex h-10 w-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground"
      >
        Logo
      </Link>

      {action === 'dashboard' ? (
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Dashboard
          </Link>
          <UserButton />
        </div>
      ) : (
        <Link
          to="/auth/sign-in"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Get started
        </Link>
      )}
    </header>
  )
}

export default Header
