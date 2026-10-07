import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react-router'
import { ArrowLeft, FileUp, Sparkles } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import Header from './components/Header.jsx'
import { apiRequest } from './lib/api.js'

const RATING_CARDS = [
  { key: 'strengths', title: 'Strengths', description: 'What is working well', color: 'text-emerald-700', background: 'bg-emerald-50' },
  { key: 'mistakes', title: 'Mistakes', description: 'What needs correction', color: 'text-rose-700', background: 'bg-rose-50' },
  { key: 'missing', title: 'Missing from your CV', description: 'Relevant guide points not evidenced in the document', color: 'text-amber-800', background: 'bg-amber-50' },
  { key: 'next_steps', title: 'HR manager’s next steps', description: 'Prioritized actions to strengthen your CV', color: 'text-blue-700', background: 'bg-blue-50' },
]

function scoreColor(score) {
  if (score < 50) return '#dc2626'
  if (score < 75) return '#d97706'
  return '#059669'
}

function RatingDashboard() {
  const { getToken } = useAuth()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { reviewId } = useParams()
  const [reviewLoad, setReviewLoad] = useState({ id: null, review: null, error: '' })
  const savedReview = reviewLoad.id === reviewId ? reviewLoad.review : null
  const savedReviewError = reviewLoad.id === reviewId ? reviewLoad.error : ''
  const isLoadingSavedReview = Boolean(reviewId && !state?.rating && reviewLoad.id !== reviewId)
  const rating = state?.rating || savedReview?.rating
  const resumeFile = state?.resumeFile
  const [animatedScore, setAnimatedScore] = useState(0)
  const [categoriesVisible, setCategoriesVisible] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [improveError, setImproveError] = useState('')

  useEffect(() => {
    if (!reviewId) return undefined

    let isCurrent = true
    async function loadReview() {
      try {
        const token = await getToken()
        const result = await apiRequest(`/reviews/${encodeURIComponent(reviewId)}`, { token })
        if (isCurrent) setReviewLoad({ id: reviewId, review: result.review, error: '' })
      } catch (error) {
        if (isCurrent) setReviewLoad({ id: reviewId, review: null, error: error.message || 'Could not load this saved AI review.' })
      }
    }

    loadReview()
    return () => {
      isCurrent = false
    }
  }, [getToken, reviewId])
  const isRatingValid = rating &&
    Number.isInteger(rating.overall_score) &&
    rating.overall_score >= 0 &&
    rating.overall_score <= 100 &&
    typeof rating.verdict === 'string' &&
    Array.isArray(rating.categories) &&
    rating.categories.length === 10 &&
    rating.categories.every((category) =>
      category &&
      typeof category.name === 'string' &&
      Number.isInteger(category.score) &&
      Number.isInteger(category.max) &&
      category.score >= 0 &&
      category.max > 0 &&
      category.score <= category.max &&
      typeof category.evidence === 'string' &&
      typeof category.points_lost_reason === 'string') &&
    rating.categories.reduce((total, category) => total + category.score, 0) === rating.overall_score &&
    Array.isArray(rating.next_steps) &&
    rating.next_steps.length > 0 &&
    RATING_CARDS.every(({ key }) => Array.isArray(rating[key]))

  useEffect(() => {
    if (!rating) return undefined
    let frame
    let startTime
    const duration = 1200
    function animate(timestamp) {
      if (startTime === undefined) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setAnimatedScore(Math.round(rating.overall_score * progress))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [rating])

  useEffect(() => {
    if (!rating) return undefined
    const timer = window.setTimeout(() => setCategoriesVisible(true), 150)
    return () => window.clearTimeout(timer)
  }, [rating])

  if (isLoadingSavedReview) {
    return <main role="status" className="min-h-screen p-8 text-slate-600">Loading your saved AI review...</main>
  }

  if (savedReviewError) {
    return (
      <div className="career-theme min-h-screen text-[#1B342B]">
        <Header action="dashboard" />
        <main className="mx-auto max-w-3xl px-6 py-12">
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{savedReviewError}</p>
          <Link to="/reviews" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to AI review history
          </Link>
        </main>
      </div>
    )
  }

  if (!isRatingValid) return <Navigate to="/home" replace />

  async function improveInBuilder() {
    if (!resumeFile) {
      setImproveError('The uploaded file is no longer available. Upload it again from Home to import it into the builder.')
      return
    }

    setIsImproving(true)
    setImproveError('')
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          if (typeof result !== 'string' || !result.includes(',')) {
            reject(new Error('Could not read the resume file.'))
            return
          }
          resolve(result.slice(result.indexOf(',') + 1))
        }
        reader.onerror = () => reject(new Error('Could not read the resume file.'))
        reader.readAsDataURL(resumeFile)
      })
      const response = await fetch('/api/extract-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: fileData, name: resumeFile.name, mimeType: resumeFile.type }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || 'Could not prepare the resume for editing.')
      if (!result?.resume || typeof result.resume !== 'object') throw new Error('AI did not return resume details.')

      const id = crypto.randomUUID()
      const title = resumeFile.name.replace(/\.[^.]+$/, '').trim() || 'Imported Resume'
      const resume = {
        ...result.resume,
        id,
        title,
        fullName: result.resume.fullName || [result.resume.firstName, result.resume.middleName, result.resume.lastName].filter(Boolean).join(' '),
        profession: result.resume.jobTitle || '',
        themeColor: '#111827',
        photo: '',
      }
      const token = await getToken()
      await apiRequest('/resumes', {
        method: 'POST',
        token,
        body: JSON.stringify({ resume }),
      })
      navigate(`/builder/${id}`, { state: { title, resume } })
    } catch (error) {
      setImproveError(error.message || 'Could not open this resume in the builder.')
    } finally {
      setIsImproving(false)
    }
  }

  const color = scoreColor(rating.overall_score)
  const circumference = 2 * Math.PI * 54

  return (
    <div className="career-theme min-h-screen text-[#1B342B]">
      <Header action="dashboard" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate('/home')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_190px]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">HR manager’s academic CV review</p>
              <h1 className="mt-2 break-words text-2xl font-bold sm:text-3xl">{state?.fileName || savedReview?.fileName || 'Your resume results'}</h1>
              {savedReview?.createdAt && <p className="mt-2 text-sm text-muted-foreground">Reviewed {new Date(savedReview.createdAt).toLocaleString()}</p>}
              <p className="mt-3 max-w-2xl text-muted-foreground">{rating.verdict}</p>
              <p className="mt-4 text-xs text-muted-foreground">Scored using the supplied Academic CV Master Guide. The guide provides no numeric weights; category weights are derived from its priorities.</p>
            </div>
            <div className="mx-auto relative flex h-40 w-40 items-center justify-center" aria-label={`Resume score ${rating.overall_score} out of 100`}>
              <svg viewBox="0 0 120 120" className="-rotate-90 h-full w-full" role="img" aria-hidden="true">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="9" className="text-muted" />
                <circle
                  cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - animatedScore / 100)}
                  className="transition-[stroke-dashoffset] duration-100 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="block text-4xl font-bold tabular-nums" style={{ color }}>{animatedScore}</span>
                <span className="text-sm text-muted-foreground">out of 100</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-xl font-semibold">Score breakdown</h2>
            <p className="mt-1 text-sm text-muted-foreground">Points are awarded for evidence in your CV and deducted when relevant guide criteria are missing or unclear. Each category explains both sides of its score.</p>
          </div>
          <div className="mt-6 space-y-5">
            {rating.categories.map((category, index) => {
              const percent = category.max > 0 ? Math.min(category.score / category.max * 100, 100) : 0
              const pointsLost = category.max - category.score
              return (
                <article key={category.name} className="rounded-xl border p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <h3 className="font-semibold">{category.name}</h3>
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">{category.score} / {category.max}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${categoriesVisible ? percent : 0}%`, transitionDelay: `${index * 70}ms` }} />
                  </div>
                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="font-medium text-emerald-700">What earned points</p>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{category.evidence}</p>
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Points not earned: {pointsLost}</p>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{category.points_lost_reason}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {RATING_CARDS.map((card, index) => (
            <section key={card.key} className={`rating-card-enter rounded-2xl border bg-card p-6 shadow-sm ${card.key === 'strengths' ? 'border-emerald-200' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-start gap-3">
                <span className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${card.background} ${card.color}`}>{card.title}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{card.description}</p>
              {rating[card.key].length === 0
                ? <p className="mt-4 text-sm text-muted-foreground">{card.key === 'strengths' ? 'Keep building on the solid evidence in your CV.' : 'No major items identified in this area.'}</p>
                : card.key === 'next_steps'
                  ? <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed marker:font-semibold marker:text-blue-700">{rating[card.key].map((item, itemIndex) => <li key={`${card.key}-${itemIndex}`} className="ps-1">{item}</li>)}</ol>
                  : <ul className="mt-4 space-y-3">{rating[card.key].map((item, itemIndex) => <li key={`${card.key}-${itemIndex}`} className="flex gap-2 text-sm leading-relaxed"><span className={`mt-0.5 ${card.color}`} aria-hidden="true">•</span><span>{item}</span></li>)}</ul>}
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {improveError && <p role="alert" className="text-sm text-destructive">{improveError}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={improveInBuilder} disabled={isImproving || !resumeFile} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
              <Sparkles className="h-4 w-4" /> {isImproving ? 'Preparing your resume...' : 'Improve this in the Resume Builder'}
            </button>
            <button type="button" onClick={() => navigate('/home#rate-resume')} className="inline-flex items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-semibold transition hover:bg-muted">
              <FileUp className="h-4 w-4" /> Upload another resume
            </button>
            <button type="button" onClick={() => navigate('/reviews')} className="inline-flex items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-semibold transition hover:bg-muted">
              View AI review history
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RatingDashboard
