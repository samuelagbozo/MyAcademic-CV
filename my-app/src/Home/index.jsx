import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@clerk/react-router'
import { Check, Clock3, Download, FileUp, FileText, Pencil, Sparkles, Trash2, Upload } from 'lucide-react'
import Header from '../components/Header.jsx'
import SpotlightCard from '../components/ui/SpotlightCard.jsx'
import TiltCard from '../components/ui/TiltCard.jsx'
import NewtonsCradle from '../components/ui/NewtonsCradle.jsx'
import AddResume from './components/addResume.jsx'
import { apiRequest } from '../lib/api.js'

const MAX_RESUME_UPLOAD_SIZE = 10 * 1024 * 1024

function Home() {
  const { getToken } = useAuth()
  const [resumes, setResumes] = useState([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [resumeError, setResumeError] = useState('')
  const [deletingResumeId, setDeletingResumeId] = useState('')
  const [shreddingResumeId, setShreddingResumeId] = useState('')
  const navigate = useNavigate()
  const resumeFileInputRef = useRef(null)
  const [isImporting, setIsImporting] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isUploadDragOver, setIsUploadDragOver] = useState(false)
  const [ratingFile, setRatingFile] = useState(null)
  const [isRating, setIsRating] = useState(false)
  const [ratingError, setRatingError] = useState('')
  const [pendingReview, setPendingReview] = useState(null)
  const recentResumes = [...resumes]
    .sort((first, second) => {
      const firstUpdated = new Date(first.updatedAt || first.createdAt || 0).getTime()
      const secondUpdated = new Date(second.updatedAt || second.createdAt || 0).getTime()
      return secondUpdated - firstUpdated
    })
    .slice(0, 3)

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

  function handleUploadFile(file) {
    if (!file || isImporting) return
    setUploadError('')
    if (!/\.(pdf|docx)$/i.test(file.name) || file.size > MAX_RESUME_UPLOAD_SIZE) {
      setUploadError('Please choose a PDF or DOCX file under 10MB.')
      return
    }
    void importResume(file)
  }

  function selectResumeFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    handleUploadFile(file)
  }

  function handleUploadDragOver(event) {
    event.preventDefault()
    if (isImporting || !Array.from(event.dataTransfer.types).includes('Files')) return
    setIsUploadDragOver(true)
  }

  function handleUploadDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsUploadDragOver(false)
  }

  function handleUploadDrop(event) {
    event.preventDefault()
    setIsUploadDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleUploadFile(file)
  }

  async function importResume(file) {
    if (!file || file.size > MAX_RESUME_UPLOAD_SIZE) {
      setUploadError('Please choose a PDF or DOCX file under 10MB.')
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
          reader.readAsDataURL(file)
      })
      const response = await fetch('/api/extract-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: fileData,
          name: file.name,
          mimeType: /\.pdf$/i.test(file.name)
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || 'Could not extract this resume.')
      if (!result?.resume || typeof result.resume !== 'object') throw new Error('AI did not return resume details.')

      const title = file.name.replace(/\.[^.]+$/, '').trim() || 'Imported Resume'
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
    if (file.size > MAX_RESUME_UPLOAD_SIZE) {
      setRatingFile(null)
      setRatingError('Choose a resume file smaller than 10 MB.')
      event.target.value = ''
      return
    }
    setRatingFile(file)
    setRatingError('')
  }

  async function rateUploadedResume() {
    if (pendingReview) {
      await retrySaveReview()
      return
    }

    if (!ratingFile) {
      setRatingError('Choose a PDF or DOCX resume to analyze.')
      return
    }
    setIsRating(true)
    setRatingError('')
    let generatedReview = null
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
      const review = { id: crypto.randomUUID(), fileName: ratingFile.name, rating: result.rating }
      generatedReview = review
      setPendingReview(review)
      await saveReviewAndOpen(review, ratingFile)
    } catch (error) {
      setRatingError(generatedReview || pendingReview
        ? `Your review is ready, but it could not be saved: ${error.message || 'Please retry saving.'}`
        : error.message || 'Could not analyze this resume. Please retry.')
    } finally {
      setIsRating(false)
    }
  }

  async function saveReviewAndOpen(review, file) {
    const token = await getToken()
    await apiRequest('/reviews', {
      method: 'POST',
      token,
      body: JSON.stringify({ review }),
    })
    setPendingReview(null)
    navigate(`/resume-rating/${encodeURIComponent(review.id)}`, {
      state: { rating: review.rating, fileName: review.fileName, resumeFile: file },
    })
  }

  async function retrySaveReview() {
    if (!pendingReview) return
    setIsRating(true)
    setRatingError('')
    try {
      await saveReviewAndOpen(pendingReview, ratingFile)
    } catch (error) {
      setRatingError(`Your review is ready, but it could not be saved: ${error.message || 'Please retry saving.'}`)
    } finally {
      setIsRating(false)
    }
  }

  return (
    <div className="career-theme min-h-screen font-sans text-[#1B342B]">
      <Header action="dashboard" />
      <input
        ref={resumeFileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        aria-label="Choose a PDF or DOCX resume to upload"
        onChange={selectResumeFile}
      />
      <main className="mx-auto min-w-0 w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 md:px-10">
        <section id="resume-list" className="mb-7 flex min-w-0 flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-[#C5F26E]" aria-hidden="true" />
              Your workspace
            </p>
            <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">My Resumes</h1>
            <p className="mt-2 break-words text-sm leading-relaxed text-slate-500">Pick up where you left off or start something new.</p>
          </div>
          <div className="flex w-fit shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-500">
            <FileText className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            {isLoadingResumes ? <NewtonsCradle label="Loading your workspace" size={24} /> : `${resumes.length} ${resumes.length === 1 ? 'resume' : 'resumes'} saved`}
          </div>
        </section>

        {resumeError && (
          <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {resumeError}
          </p>
        )}

        {isLoadingResumes && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white py-5">
            <NewtonsCradle label="Loading your saved resumes" />
          </div>
        )}

        <section aria-labelledby="resume-actions-heading" className="mb-10 min-w-0">
          <h2 id="resume-actions-heading" className="mb-4 text-lg font-semibold text-slate-900">Get started</h2>
          <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 min-[480px]:grid-cols-2 sm:gap-6">
            <AddResume onCreate={addResume} />
            <SpotlightCard
              onDragOver={handleUploadDragOver}
              onDragLeave={handleUploadDragLeave}
              onDrop={handleUploadDrop}
              className={`group h-full min-h-[280px] w-full min-w-0 rounded-3xl border border-[#1B342B]/10 bg-[#FFFEFA] shadow-[0_8px_30px_-25px_rgba(27,52,43,0.5)] transition-[border-color,box-shadow] hover:border-[#83AE40]/40 hover:shadow-[0_16px_36px_-24px_rgba(27,52,43,0.32)] ${isUploadDragOver ? 'career-upload-drop-target' : ''}`}
            >
              <div className="flex h-full min-h-[280px] w-full min-w-0 flex-col items-center gap-4 break-words p-4 text-center sm:p-6">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1B342B]/10 bg-white text-[#2C4A3E] shadow-sm transition-transform group-hover:scale-105">
                  <Upload className="upload-icon h-6 w-6" aria-hidden="true" />
                </span>
                <span className="break-words font-semibold text-[#1B342B]">Upload your resume with AI</span>
                <span className="max-w-60 break-words text-sm leading-relaxed text-[#71806F]">Drop in a PDF or DOCX and let AI help you get started.</span>
                <button
                  type="button"
                  onClick={() => resumeFileInputRef.current?.click()}
                  disabled={isImporting}
                  className="mt-auto rounded-full bg-[#C5F26E] px-5 py-2.5 text-sm font-semibold text-[#1B342B] transition-colors hover:bg-[#b9e85e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80"
                >
                  {isImporting ? 'Uploading...' : 'Choose a file'}
                </button>
                {uploadError && <p role="alert" aria-live="assertive" className="max-w-full break-words text-sm font-medium text-red-700 dark:text-red-300">{uploadError}</p>}
              </div>
            </SpotlightCard>
          </div>
        </section>

        <TiltCard className="mb-10 min-w-0" maxTilt={3} lift={4}>
        <section id="rate-resume" className="career-review-history-card scroll-mt-6 min-w-0 rounded-2xl p-4 sm:p-6 md:p-8">
          <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-[#83AE40]/50 bg-[#EDF2E6] px-2.5 py-1 text-xs font-medium text-[#42633A]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI-powered
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#1B342B]">Rate your resume with AI</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#647168]">
                Get a detailed academic CV review against the Academic CV Master Guide, with a score and practical next steps.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <label htmlFor="rating-resume-file" className={`inline-flex min-h-11 max-w-full min-w-0 items-center gap-2 rounded-lg border-2 border-[#1B342B]/50 bg-[#FFFEFA] px-3 py-2.5 text-sm font-medium text-[#526158] shadow-[3px_3px_0_rgba(44,74,62,0.14)] transition-colors focus-within:ring-2 focus-within:ring-[#83AE40] sm:px-4 ${pendingReview ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-[#EDF2E6]'}`}>
                  <FileUp className="h-4 w-4 text-[#567B42]" aria-hidden="true" />
                  <span className="min-w-0 break-all">{ratingFile?.name || 'Choose PDF or DOCX'}</span>
                </label>
                <input id="rating-resume-file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={selectRatingFile} disabled={isRating || Boolean(pendingReview)} />
                <span className="text-xs text-[#71806F]">Text-based files up to 10 MB</span>
              </div>
              {ratingError && <p role="alert" className="mt-3 text-sm text-rose-600">{ratingError}</p>}
              {isRating && <p role="status" aria-live="polite" className="mt-3 text-sm text-[#647168]">Analyzing your resume against the guide. This may take a moment...</p>}
            </div>

            <div className="rounded-xl border-2 border-[#1B342B] bg-[#F2EFE6] p-5 shadow-[5px_5px_0_#2C4A3E]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1B342B]">Your CV review</span>
                <span className="rounded-full border border-[#1B342B]/15 bg-[#FFFEFA] px-2.5 py-1 text-xs font-medium text-[#647168]">PDF or DOCX</span>
              </div>
              <div className="mt-4 flex items-center">
                <img src="/academic-cv-logo.png" alt="My Academic CV" className="brand-wordmark h-10 w-40 object-contain object-left" />
              </div>
              <p className="mt-1 text-sm text-[#647168]">Score, strengths, and prioritized improvements. Completed reviews are saved to your history.</p>
              <button type="button" onClick={rateUploadedResume} disabled={!ratingFile || isRating} className="career-raised-button mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
                {isRating && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
                {isRating ? pendingReview ? 'Saving your review...' : 'Analyzing your resume...' : pendingReview ? 'Save and open review' : 'Rate my CV'}
              </button>
              {ratingError && ratingFile && (
                <button type="button" disabled={isRating} onClick={pendingReview ? retrySaveReview : rateUploadedResume} className="mt-3 w-full text-sm font-medium text-[#42633A] underline underline-offset-4 disabled:opacity-50">
                  {pendingReview ? 'Retry saving review' : 'Retry analysis'}
                </button>
              )}
            </div>
          </div>
        </section>
        </TiltCard>

        <section aria-labelledby="resume-history-heading" className="mb-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="resume-history-heading" className="text-lg font-semibold text-slate-900">Resume history</h2>
              <p className="mt-1 text-sm text-slate-500">Your 3 most recently updated resumes.</p>
            </div>
            <button type="button" onClick={() => navigate('/resumes')} className="rounded-full border border-[#1B342B]/15 bg-[#FFFEFA] px-4 py-2 text-sm font-semibold text-[#1B342B] transition hover:border-[#83AE40] hover:bg-[#EDF2E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40]">
              View all resumes
            </button>
          </div>
        {shreddingResumeId && <p className="sr-only" role="status">Shredding deleted resume.</p>}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {!isLoadingResumes && recentResumes.map((resume) => {
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
                          <p title={displayName || resume.title || 'Your name'} className="truncate text-[10px] font-bold text-slate-800">{displayName || resume.title || 'Your name'}</p>
                          <p title={role} className="truncate text-[9px] text-slate-400">{role}</p>
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
                  <h2 title={resume.title || 'Untitled resume'} className="truncate font-semibold text-slate-800 transition-colors group-hover:text-indigo-700">{resume.title || 'Untitled resume'}</h2>
                  <p title={role} className="mt-1 truncate text-xs text-slate-500">{role}</p>
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

      </main>

    </div>
  )
}

export default Home
