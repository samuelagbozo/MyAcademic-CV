import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react-router'
import { ArrowLeft, Clock3, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import Header from './components/Header.jsx'
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
      <main className="mx-auto w-full max-w-[1400px] px-6 py-8 md:px-10">
        <Link to="/home" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Dashboard
        </Link>
        <section className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Your workspace</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Resume history</h1>
            <p className="mt-2 text-sm text-slate-500">All your saved resumes, sorted by most recently updated.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-500">
            {isLoading ? 'Loading...' : `${resumes.length} ${resumes.length === 1 ? 'resume' : 'resumes'}`}
          </span>
        </section>

        {error && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {isLoading && <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Loading your saved resumes...</p>}

        {!isLoading && resumes.length === 0 && (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No saved resumes yet</h2>
            <p className="mt-2 text-sm text-slate-500">Create or import a resume to see it in your history.</p>
            <Link to="/home" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" aria-hidden="true" /> Create a resume
            </Link>
          </section>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {!isLoading && resumes.map((resume) => {
            const savedAt = resume.updatedAt || resume.createdAt
            const displayName = resume.fullName || [resume.firstName, resume.middleName, resume.lastName].filter(Boolean).join(' ')
            return (
              <article key={resume.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-900">{resume.title || 'Untitled resume'}</h2>
                    <p className="mt-1 truncate text-sm text-slate-500">{displayName || resume.profession || resume.jobTitle || 'Resume draft'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteResume(resume.id)}
                    disabled={deletingId === resume.id}
                    aria-label={`Delete ${resume.title}`}
                    className="trash-action rounded-md p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  >
                    <Trash2 className="trash-icon h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}` : 'Not saved yet'}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/builder/${resume.id}`, { state: { title: resume.title } })}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
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
