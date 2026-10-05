import { useState } from 'react'
import { useNavigate } from 'react-router'
import { FileUp, Pencil, Trash2 } from 'lucide-react'
import Header from '../components/Header.jsx'
import AddResume from './components/addResume.jsx'

function Home() {
  const [resumes, setResumes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('resume-builder-resumes') || '[]')
    } catch {
      return []
    }
  })
  const navigate = useNavigate()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')

  function addResume(resume) {
    setResumes((current) => {
      const updated = [...current, resume]
      localStorage.setItem('resume-builder-resumes', JSON.stringify(updated))
      return updated
    })
    navigate(`/builder/${resume.id}`, { state: { title: resume.title } })
  }

  function deleteResume(resumeId) {
    setResumes((current) => {
      const updated = current.filter((resume) => resume.id !== resumeId)
      localStorage.setItem('resume-builder-resumes', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header action="dashboard" />
      <main className="p-6">
        <h1 className="text-3xl font-bold">My Resume</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Welcome to your resume builder! Use the dashboard to create and manage your resumes.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <article key={resume.id} className="relative min-h-52 rounded-xl border bg-card text-card-foreground shadow-sm transition hover:bg-muted/70">
              <div className="absolute right-3 top-3 flex gap-1">
                <button
                  type="button"
                  aria-label={`Edit ${resume.title}`}
                  title="Edit resume"
                  onClick={() => navigate(`/builder/${resume.id}`, { state: { title: resume.title } })}
                  className="rounded-md p-2 text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${resume.title}`}
                  title="Delete resume"
                  onClick={() => deleteResume(resume.id)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/builder/${resume.id}`, { state: { title: resume.title } })}
                className="min-h-52 w-full p-6 pr-24 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <h2 className="text-lg font-semibold">{resume.title}</h2>
                {resume.fullName && <p className="mt-2 text-sm text-muted-foreground">{resume.fullName}</p>}
                {resume.professionalTitle && <p className="text-sm text-muted-foreground">{resume.professionalTitle}</p>}
                <p className="mt-4 text-sm text-muted-foreground">Open resume</p>
              </button>
            </article>
          ))}
          <AddResume onCreate={addResume} />
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="group flex min-h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/70 p-6 text-center transition hover:border-primary/50 hover:bg-muted/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted transition group-hover:bg-background">
              <FileUp className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
            </span>
            <span className="font-medium">Upload your resume with AI</span>
            <span className="text-sm text-muted-foreground">Choose a resume file from your computer</span>
          </button>
        </div>

        <section className="mt-16 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold">Rate your resume</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Upload your resume and AI will help review and rate it. Resume rating will be available here soon.
          </p>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FileUp className="h-4 w-4" aria-hidden="true" />
            Upload your resume
          </button>
        </section>
      </main>

      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsUploadOpen(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="upload-resume-heading" className="w-full max-w-lg rounded-xl border bg-background p-6 text-foreground shadow-xl">
            <h2 id="upload-resume-heading" className="text-xl font-semibold">Upload your resume</h2>
            <p className="mt-2 text-sm text-muted-foreground">Select a resume file from your computer. AI processing will be added later.</p>
            <label htmlFor="resume-file" className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-6 text-center transition hover:bg-muted/60">
              <FileUp className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">{uploadedFileName || 'Choose a file to upload'}</span>
              <span className="text-xs text-muted-foreground">PDF, DOC, or DOCX</span>
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(event) => setUploadedFileName(event.target.files?.[0]?.name || '')}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsUploadOpen(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
              <button type="button" disabled={!uploadedFileName} onClick={() => setIsUploadOpen(false)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">Select file</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Home
