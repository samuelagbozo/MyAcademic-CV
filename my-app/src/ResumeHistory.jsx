import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react-router'
import { ArrowLeft, Clock3, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import Header from './components/Header.jsx'
import NewtonsCradle from './components/ui/NewtonsCradle.jsx'
import { apiRequest } from './lib/api.js'

function ResumeHistory() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadResumes() {
      try {
        const token = await getToken()
        const result = await apiRequest('/resumes', { token })
        if (isCurrent) setResumes(result.resumes)
      } catch (loadError) {
        if (isCurrent) setError(loadError.message || 'Could not load your saved resumes.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadResumes()
    return () => {
      isCurrent = false
    }
  }, [getToken])

  async function deleteResume(resumeId) {
    setDeletingId(resumeId)
    setError('')
    try {
      const token = await getToken()
      await apiRequest(`/resumes/${encodeURIComponent(resumeId)}`, { method: 'DELETE', token })
      setResumes((current) => current.filter((resume) => resume.id !== resumeId))
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete this resume.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="career-theme min-h-screen font-sans text-[#1B342B]">
      <Header action="dashboard" />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 md:px-10">
        <Link to="/home" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#526158] transition-colors hover:text-[#1B342B]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Dashboard
        </Link>
        <section className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#567B42]">Your workspace</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#1B342B] sm:text-4xl">Resume history</h1>
            <p className="mt-2 text-sm text-[#647168]">All your saved resumes, sorted by most recently updated.</p>
          </div>
          <span className="rounded-full border border-[#1B342B]/20 bg-[#FFFEFA] px-3.5 py-2 text-xs font-medium text-[#526158] shadow-[3px_3px_0_rgba(44,74,62,0.16)]">
            {isLoading ? <NewtonsCradle label="Loading resumes" size={24} /> : `${resumes.length} ${resumes.length === 1 ? 'resume' : 'resumes'}`}
          </span>
        </section>

        {error && <p role="alert" className="mb-5 rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-[4px_4px_0_rgba(136,19,55,0.12)]">{error}</p>}
        {isLoading && <div className="rounded-xl border-2 border-[#1B342B] bg-[#FFFEFA] py-5 shadow-[5px_5px_0_#2C4A3E]"><NewtonsCradle label="Loading your saved resumes" /></div>}

        {!isLoading && resumes.length === 0 && (
          <section className="rounded-2xl border-2 border-dashed border-[#2C4A3E]/50 bg-[#FFFEFA] px-6 py-16 text-center shadow-[5px_5px_0_rgba(44,74,62,0.18)]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF2E6] text-[#2C4A3E]">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-[#1B342B]">No saved resumes yet</h2>
            <p className="mt-2 text-sm text-[#647168]">Create or import a resume to see it in your history.</p>
            <Link to="/home" className="career-raised-button mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold">
              <Plus className="h-4 w-4" aria-hidden="true" /> Create a resume
            </Link>
          </section>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {!isLoading && resumes.map((resume) => {
            const savedAt = resume.updatedAt || resume.createdAt
            const displayName = resume.fullName || [resume.firstName, resume.middleName, resume.lastName].filter(Boolean).join(' ')
            return (
              <article key={resume.id} className="career-review-history-card flex flex-col rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 title={resume.title || 'Untitled resume'} className="truncate font-semibold text-[#1B342B]">{resume.title || 'Untitled resume'}</h2>
                    <p title={displayName || resume.profession || resume.jobTitle || 'Resume draft'} className="mt-1 truncate text-sm text-[#647168]">{displayName || resume.profession || resume.jobTitle || 'Resume draft'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteResume(resume.id)}
                    disabled={deletingId === resume.id}
                    aria-label={`Delete ${resume.title}`}
                    className="trash-action rounded-lg border-2 border-[#1B342B]/20 bg-[#FFFEFA] p-2 text-[#526158] shadow-[3px_3px_0_rgba(44,74,62,0.14)] transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-50"
                  >
                    <Trash2 className="trash-icon h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs text-[#71806F]">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}` : 'Not saved yet'}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/builder/${resume.id}`, { state: { title: resume.title } })}
                  className="career-raised-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Open resume
                </button>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default ResumeHistory
