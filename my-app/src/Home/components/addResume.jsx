import { useState } from 'react'
import { PlusSquare } from 'lucide-react'

const fieldClassName = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

function AddResume({ onCreate }) {
  const [dialog, setDialog] = useState(null)
  const [title, setTitle] = useState('')

  function closeDialogs() {
    setDialog(null)
    setTitle('')
  }

  function createResume(event) {
    event.preventDefault()
    if (!title.trim()) return
    onCreate({ id: crypto.randomUUID(), title: title.trim() })
    closeDialogs()
  }

  function handleCardKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setDialog('title')
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Add a resume"
        onClick={() => setDialog('title')}
        onKeyDown={handleCardKeyDown}
        className="group flex min-h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/70 p-6 text-center transition hover:border-primary/50 hover:bg-muted/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted transition group-hover:bg-background">
          <PlusSquare className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <span className="font-medium">Create a new resume</span>
        <span className="text-sm text-muted-foreground">Click anywhere on this card to start</span>
      </div>

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
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeDialogs} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
              <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Create</button>
            </div>
          </form>
          </section>
        </div>
      )}
    </>
  )
}

export default AddResume
