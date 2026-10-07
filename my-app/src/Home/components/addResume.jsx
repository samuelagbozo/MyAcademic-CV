import { useState } from 'react'
import { SquarePlus } from 'lucide-react'

const fieldClassName = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

function AddResume({ onCreate }) {
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
      <div
        role="button"
        tabIndex={0}
        aria-label="Add a resume"
        onClick={() => setDialog('title')}
        onKeyDown={handleCardKeyDown}
        className="group flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-100 bg-white text-indigo-600 shadow-sm transition-transform group-hover:scale-105">
          <SquarePlus className="add-icon h-7 w-7" aria-hidden="true" />
        </div>
        <span className="font-semibold text-slate-800">Create a new resume</span>
        <span className="max-w-60 text-sm text-slate-400">Start from scratch and build a resume that stands out.</span>
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
