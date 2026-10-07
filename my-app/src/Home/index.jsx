import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@clerk/react-router'
import { Check, Clock3, Download, FileUp, FileText, GraduationCap, Pencil, Sparkles, Trash2, Upload } from 'lucide-react'
import Header from '../components/Header.jsx'
import AddResume from './components/addResume.jsx'
import { apiRequest } from '../lib/api.js'

function Home() {
  const { getToken } = useAuth()
  const [resumes, setResumes] = useState([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [resumeError, setResumeError] = useState('')
  const [deletingResumeId, setDeletingResumeId] = useState('')
  const [shreddingResumeId, setShreddingResumeId] = useState('')
  const navigate = useNavigate()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [ratingFile, setRatingFile] = useState(null)
  const [isRating, setIsRating] = useState(false)
  const [ratingError, setRatingError] = useState('')

  function openResume(resume) {
    navigate(`/builder/${resume.id}`, { state: { title: resume.title } })
  }

  useEffect(() => {
    let isCurrent = true

    async function loadResumes() {
      try {
        const token = await getToken()
        const result = await apiRequest('/resumes', { token })
        if (isCurrent) setResumes(result.resumes)
      } catch (error) {
        if (isCurrent) setResumeError(error.message || 'Could not load your saved resumes.')
      } finally {
        if (isCurrent) setIsLoadingResumes(false)
      }
    }

    loadResumes()
    return () => {
      isCurrent = false
    }
  }, [getToken])

  async function addResume(resume) {
    setResumeError('')
    try {
      const token = await getToken()
      await apiRequest('/resumes', {
        method: 'POST',
        token,
        body: JSON.stringify({ resume }),
      })
      navigate(`/builder/${resume.id}`, { state: { title: resume.title } })
      return true
    } catch (error) {
      setResumeError(error.message || 'Could not save this resume.')
      return false
    }
  }

  async function deleteResume(resumeId) {
    setDeletingResumeId(resumeId)
    setResumeError('')
    try {
      const token = await getToken()
      await apiRequest(`/resumes/${encodeURIComponent(resumeId)}`, {
        method: 'DELETE',
        token,
      })
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setResumes((current) => current.filter((resume) => resume.id !== resumeId))
      } else {
        setShreddingResumeId(resumeId)
      }
    } catch (error) {
      setResumeError(error.message || 'Could not delete this resume.')
    } finally {
      setDeletingResumeId('')
    }
  }

  function selectResumeFile(event) {
    setUploadedFile(event.target.files?.[0] || null)
    setUploadError('')
  }

  async function importResume() {
    if (!uploadedFile) return
    if (uploadedFile.size > 8 * 1024 * 1024) {
      setUploadError('Choose a resume file smaller than 8 MB.')
      return
    }

    setIsImporting(true)
    setUploadError('')
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          if (typeof result !== 'string' || !result.includes(',')) {
            reject(new Error('Could not read the selected file.'))
            return
          }
          resolve(result.slice(result.indexOf(',') + 1))
        }
        reader.onerror = () => reject(new Error('Could not read the selected file.'))
        reader.readAsDataURL(uploadedFile)
      })
      const response = await fetch('/api/extract-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: fileData, name: uploadedFile.name, mimeType: uploadedFile.type }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || 'Could not extract this resume.')
      if (!result?.resume || typeof result.resume !== 'object') throw new Error('AI did not return resume details.')

      const title = uploadedFile.name.replace(/\.[^.]+$/, '').trim() || 'Imported Resume'
      const saved = await addResume({
        ...result.resume,
        id: crypto.randomUUID(),
        title,
        fullName: result.resume.fullName || [result.resume.firstName, result.resume.middleName, result.resume.lastName].filter(Boolean).join(' '),
        profession: result.resume.jobTitle || '',
        themeColor: '#111827',
        photo: '',
      })
      if (!saved) setUploadError('Could not save the imported resume. Please try again.')
    } catch (error) {
      setUploadError(error.message || 'Could not import this resume. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  function selectRatingFile(event) {
    const file = event.target.files?.[0] || null
    if (!file) {
      setRatingFile(null)
      return
    }
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setRatingFile(null)
      setRatingError('Choose a PDF or DOCX file.')
      event.target.value = ''
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setRatingFile(null)
      setRatingError('Choose a resume file smaller than 8 MB.')
      event.target.value = ''
      return
    }
    setRatingFile(file)
    setRatingError('')
  }

  async function rateUploadedResume() {
    if (!ratingFile) {
      setRatingError('Choose a PDF or DOCX resume to analyze.')
      return
    }
    setIsRating(true)
    setRatingError('')
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          if (typeof result !== 'string' || !result.includes(',')) {
            reject(new Error('Could not read the selected file.'))
            return
          }
          resolve(result.slice(result.indexOf(',') + 1))
        }
        reader.onerror = () => reject(new Error('Could not read the selected file.'))
        reader.readAsDataURL(ratingFile)
      })
      const response = await fetch('/api/rate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: fileData, name: ratingFile.name, mimeType: ratingFile.type }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || 'Could not analyze this resume. Please retry.')
      if (!result?.rating || typeof result.rating !== 'object') throw new Error('The AI did not return a valid rating. Please retry.')
      const reviewId = crypto.randomUUID()
      const token = await getToken()
      await apiRequest('/reviews', {
        method: 'POST',
        token,
        body: JSON.stringify({
          review: {
            id: reviewId,
            fileName: ratingFile.name,
            rating: result.rating,
          },
        }),
      })
      navigate(`/resume-rating/${reviewId}`, { state: { rating: result.rating, fileName: ratingFile.name, resumeFile: ratingFile } })
    } catch (error) {
      setRatingError(error.message || 'Could not analyze this resume. Please retry.')
    } finally {
      setIsRating(false)
    }
  }

  return (
    <div className="career-theme min-h-screen font-sans text-[#1B342B]">
      <Header action="dashboard" />
      <main className="mx-auto w-full max-w-[1400px] px-6 py-8 md:px-10">
        <section id="resume-list" className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" aria-hidden="true" />
              Your workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">My Resumes</h1>
            <p className="mt-2 text-sm text-slate-500">Pick up where you left off or start something new.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-500 sm:flex">
            <FileText className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            {isLoadingResumes ? 'Loading your workspace' : `${resumes.length} ${resumes.length === 1 ? 'resume' : 'resumes'} saved`}
          </div>
        </section>

        {resumeError && (
          <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {resumeError}
          </p>
        )}

        {isLoadingResumes && (
          <p role="status" className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Loading your saved resumes...
          </p>
        )}

        <section aria-labelledby="resume-actions-heading" className="mb-10">
          <h2 id="resume-actions-heading" className="mb-4 text-lg font-semibold text-slate-900">Get started</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AddResume onCreate={addResume} />
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="group flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-100 bg-white text-indigo-600 shadow-sm transition-transform group-hover:scale-105">
                <Upload className="upload-icon h-6 w-6" aria-hidden="true" />
              </span>
              <span className="font-semibold text-slate-800">Upload your resume with AI</span>
              <span className="max-w-60 text-sm text-slate-400">Drop in a PDF or DOCX and let AI help you get started.</span>
            </button>
          </div>
        </section>

        <section aria-labelledby="resume-history-heading" className="mb-10">
          <h2 id="resume-history-heading" className="mb-4 text-lg font-semibold text-slate-900">Resume history</h2>
        {shreddingResumeId && <p className="sr-only" role="status">Shredding deleted resume.</p>}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {!isLoadingResumes && resumes.map((resume) => {
            const displayName = resume.fullName || [resume.firstName, resume.middleName, resume.lastName].filter(Boolean).join(' ')
            const role = resume.profession || resume.jobTitle || resume.professionalTitle || 'Professional resume'
            const isComplete = Boolean(displayName && resume.summary && (resume.education?.length || resume.experience?.length))
            const savedAt = resume.updatedAt || resume.createdAt
            const savedDate = savedAt
              ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(savedAt))
              : 'Not saved yet'

            return (
              <div
                key={resume.id}
                className="resume-shredder-slot"
                data-shredding={shreddingResumeId === resume.id || undefined}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget.querySelector('article') || event.animationName !== 'resume-paper-shred') return
                  setResumes((current) => current.filter((item) => item.id !== resume.id))
                  setShreddingResumeId('')
                }}
              >
              <article
                aria-hidden={shreddingResumeId === resume.id || undefined}
                inert={shreddingResumeId === resume.id}
                className="group flex min-h-[340px] flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(60,70,110,0.2)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${isComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {isComplete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Pencil className="h-3 w-3" aria-hidden="true" />}
                    {isComplete ? 'Ready to review' : 'In progress'}
                  </span>
                  <div className="flex items-center gap-1 text-slate-300">
                    <button
                      type="button"
                      aria-label={`Edit ${resume.title}`}
                      title="Edit resume"
                      onClick={() => openResume(resume)}
                      className="rounded-md p-1.5 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${resume.title}`}
                      title="Delete resume"
                      onClick={() => deleteResume(resume.id)}
                      disabled={Boolean(deletingResumeId || shreddingResumeId)}
                      className="trash-action rounded-md p-1.5 transition-colors hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50"
                    >
                      <Trash2 className="trash-icon h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <button type="button" onClick={() => openResume(resume)} className="mb-4 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  <div className="relative mb-4 h-36 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 px-5 pt-3">
                    <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/90 to-transparent" aria-hidden="true" />
                    <div className="relative mx-auto h-full max-w-xs rounded-t-lg border border-slate-100 bg-white p-3 shadow-sm">
                      <div className="mb-2 flex gap-2">
                        <span className="h-7 w-7 shrink-0 rounded-full bg-indigo-100 text-center text-[10px] font-semibold leading-7 text-indigo-700">
                          {(displayName || 'R').slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="truncate text-[10px] font-bold text-slate-800">{displayName || resume.title || 'Your name'}</p>
                          <p className="truncate text-[9px] text-slate-400">{role}</p>
                        </div>
                      </div>
                      <div className="mb-2 h-px bg-slate-100" />
                      <div className="space-y-1.5">
                        <div className="h-1 w-1/3 rounded bg-indigo-200" />
                        <div className="h-1 w-full rounded bg-slate-100" />
                        <div className="h-1 w-5/6 rounded bg-slate-100" />
                        <div className="mt-2 h-1 w-1/4 rounded bg-indigo-200" />
                        <div className="h-1 w-11/12 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                  <h2 className="truncate font-semibold text-slate-800 transition-colors group-hover:text-indigo-700">{resume.title || 'Untitled resume'}</h2>
                  <p className="mt-1 truncate text-xs text-slate-500">{role}</p>
                </button>

                <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Last saved {savedDate}
                </div>
                <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => openResume(resume)} className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                    Open resume
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/builder/${resume.id}`, { state: { title: resume.title, printOnLoad: true } })}
                    aria-label={`Download ${resume.title}`}
                    title="Download or print resume"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
              <div className="resume-shredder-slit" aria-hidden="true">
                {Array.from({ length: 14 }, (_, index) => (
                  <span key={index} style={{ '--strip-index': index }} />
                ))}
              </div>
              </div>
            )
          })}
        </div>
        </section>

        <section id="rate-resume" className="scroll-mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] md:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI-powered
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Rate your resume with AI</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                Get a detailed academic CV review against the Academic CV Master Guide, with a score and practical next steps.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <label htmlFor="rating-resume-file" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
                  <FileUp className="h-4 w-4 text-rose-500" aria-hidden="true" />
                  {ratingFile?.name || 'Choose PDF or DOCX'}
                </label>
                <input id="rating-resume-file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={selectRatingFile} disabled={isRating} />
                <span className="text-xs text-slate-400">Text-based files up to 8 MB</span>
              </div>
              {ratingError && <p role="alert" className="mt-3 text-sm text-rose-600">{ratingError}</p>}
              {isRating && <p role="status" aria-live="polite" className="mt-3 text-sm text-slate-500">Analyzing your resume against the guide. This may take a moment...</p>}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Your CV review</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500">PDF or DOCX</span>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <GraduationCap className="mb-1 h-7 w-7 text-indigo-500" aria-hidden="true" />
                <span className="text-2xl font-bold text-slate-800">Academic CV</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Score, strengths, and prioritized improvements.</p>
              <button type="button" onClick={rateUploadedResume} disabled={!ratingFile || isRating} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                {isRating && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
                {isRating ? 'Analyzing your resume...' : 'Rate my CV'}
              </button>
              {ratingError && ratingFile && (
                <button type="button" disabled={isRating} onClick={rateUploadedResume} className="mt-3 w-full text-sm font-medium text-indigo-600 underline underline-offset-4 disabled:opacity-50">
                  Retry analysis
                </button>
              )}
            </div>
          </div>
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
            <p className="mt-2 text-sm text-muted-foreground">DeepSeek will extract available details and prefill a new resume. Your file is sent to Token Harbor for processing.</p>
            <label htmlFor="resume-file" className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-6 text-center transition hover:bg-muted/60">
              <FileUp className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">{uploadedFile?.name || 'Choose a file to upload'}</span>
              <span className="text-xs text-muted-foreground">PDF, DOC, or DOCX (up to 8 MB)</span>
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={selectResumeFile}
            />
            {uploadError && <p role="alert" className="mt-3 text-sm text-red-600">{uploadError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={isImporting} onClick={() => { setIsUploadOpen(false); setUploadedFile(null); setUploadError('') }} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">Cancel</button>
              <button type="button" disabled={!uploadedFile || isImporting} onClick={importResume} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{isImporting ? 'Analyzing resume...' : 'Analyze and import'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Home
