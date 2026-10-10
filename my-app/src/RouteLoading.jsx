import NewtonsCradle from './components/ui/NewtonsCradle.jsx'

function RouteLoading({ label }) {
  return (
    <main className="min-h-screen bg-[#F2EFE6] dark:bg-[#101812]">
      <NewtonsCradle label={label} className="min-h-screen" />
    </main>
  )
}

export default RouteLoading
