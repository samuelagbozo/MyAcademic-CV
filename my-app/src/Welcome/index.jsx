import Header from '../components/Header.jsx'

function Welcome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header action="get-started" />
      <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Welcome</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Sign in to continue to your home page and dashboard.
        </p>
      </main>
    </div>
  )
}

export default Welcome
