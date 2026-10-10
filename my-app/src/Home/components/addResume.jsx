import { useState } from 'react'
import { LoaderCircle, SquarePlus } from 'lucide-react'
import SpotlightCard from '../../components/ui/SpotlightCard.jsx'

const fieldClassName = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

function AddResume({ onCreate, isCreating = false, isWakingServer = false, error = '', onRetry }) {
  const [dialog, setDialog] = useState(null)
  const [title, setTitle] = useState('')

  function closeDialogs() {
    setDialog(null)
    setTitle('')
  }

  async function createResume(event) {
    event.preventDefault()
    if (!title.trim()) return
    const created = await onCreate({ id: crypto.randomUUID(), title: title.trim() })
    if (created) closeDialogs()
  }

  function handleCardKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setDialog('title')
    }
  }

  return (
    <>
      <SpotlightCard className="group h-full min-h-[280px] w-full min-w-0 rounded-3xl border border-[#1B342B]/10 bg-[#FFFEFA] shadow-[0_8px_30px_-25px_rgba(27,52,43,0.5)] transition-[border-color,box-shadow] hover:border-[#83AE40]/40 hover:shadow-[0_16px_36px_-24px_rgba(27,52,43,0.32)]">
        <div
          role="button"
          tabIndex={0}
          aria-label="Add a resume"
          onClick={() => setDialog('title')}
          onKeyDown={handleCardKeyDown}
          className="flex h-full min-h-[280px] min-w-0 cursor-pointer flex-col items-center gap-4 break-words p-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#83AE40] sm:p-6"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1B342B]/10 bg-white text-[#2C4A3E] shadow-sm transition-transform group-hover:scale-105">
            <SquarePlus className="add-icon h-7 w-7" aria-hidden="true" />
          </div>
          <span className="break-words font-semibold text-[#1B342B]">Create a new resume</span>
          <span className="max-w-60 break-words text-sm leading-relaxed text-[#71806F]">Start from scratch and build a resume that stands out.</span>
          <span aria-hidden="true" className="mt-auto rounded-full bg-[#C5F26E] px-5 py-2.5 text-sm font-semibold text-[#1B342B] transition-colors group-hover:bg-[#b9e85e]">Get started</span>
        </div>
      </SpotlightCard>

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialogs()
          }}
        >
          <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-title-heading"
          className="w-full max-w-lg rounded-xl border bg-background p-6 text-foreground shadow-xl"
        >
          <form onSubmit={createResume}>
            <h2 id="resume-title-heading" className="text-xl font-semibold">Name your resume</h2>
            <p className="mt-2 text-sm text-muted-foreground">Choose a title so you can find this resume later.</p>
            <label htmlFor="resume-title" className="mt-5 block text-sm font-medium">Resume title</label>
            <input
              id="resume-title"
              name="title"
              autoFocus
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Product Designer Resume"
              className={`${fieldClassName} mt-2`}
            />
            {isCreating && <p role="status" aria-live="polite" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Creating your resume...</p>}
            {isWakingServer && <p className="mt-2 text-sm text-muted-foreground">Waking up the server, this can take a moment on the first try.</p>}
            {error && <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><p>{error}</p><button type="button" onClick={onRetry} className="mt-2 font-semibold underline underline-offset-2">Try again</button></div>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeDialogs} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
              <button type="submit" disabled={isCreating} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-wait disabled:opacity-70">{isCreating && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}{isCreating ? 'Creating your resume...' : 'Create'}</button>
            </div>
          </form>
          </section>
        </div>
      )}
    </>
  )
}

export default AddResume
