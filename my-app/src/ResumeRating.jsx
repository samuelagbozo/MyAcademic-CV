import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react-router'
import { ArrowLeft, FileUp, Sparkles, Trash2 } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import Header from './components/Header.jsx'
import NewtonsCradle from './components/ui/NewtonsCradle.jsx'
import TiltedCard from './components/ui/TiltedCard.jsx'
import BorderGlow from './components/ui/BorderGlow.jsx'
import ScrollRevealPanel from './components/ui/ScrollRevealPanel.jsx'
import { apiRequest } from './lib/api.js'

const RATING_CARDS = [
  { key: 'strengths', title: 'Strengths', description: 'What is working well', color: 'text-[#42633A]', background: 'bg-[#EDF2E6]' },
  { key: 'mistakes', title: 'Mistakes', description: 'What needs correction', color: 'text-rose-700', background: 'bg-rose-50' },
  { key: 'missing', title: 'Missing from your CV', description: 'Relevant guide points not evidenced in the document', color: 'text-amber-800', background: 'bg-amber-50' },
  { key: 'next_steps', title: 'HR manager’s next steps', description: 'Prioritized actions to strengthen your CV', color: 'text-[#2C4A3E]', background: 'bg-[#E8EEE2]' },
]

function scoreColor(score) {
  if (score < 40) return '#F87171'
  if (score < 70) return '#FACC15'
  return '#C5F26E'
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
  const rating = savedReview?.rating || state?.rating
  const resumeFile = state?.resumeFile
  const [animatedScore, setAnimatedScore] = useState(0)
  const [categoriesVisible, setCategoriesVisible] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [improveError, setImproveError] = useState('')
  const [isDeletingReview, setIsDeletingReview] = useState(false)
  const [deleteReviewError, setDeleteReviewError] = useState('')

  useEffect(() => {
    if (!reviewId) return undefined

    let isCurrent = true
    async function loadReview() {
      try {
        const token = await getToken()
        const result = await apiRequest(`/reviews/${encodeURIComponent(reviewId)}`, { token })
        if (isCurrent) setReviewLoad({ id: reviewId, review: result.review, error: '' })
      } catch (error) {
        if (!state?.rating || error.message !== 'AI review not found.') {
          if (isCurrent) setReviewLoad({ id: reviewId, review: null, error: error.message || 'Could not load this saved AI review.' })
          return
        }

        try {
          const token = await getToken()
          const result = await apiRequest('/reviews', {
            method: 'POST',
            token,
            body: JSON.stringify({
              review: {
                id: reviewId,
                fileName: state.fileName || 'Resume review',
                rating: state.rating,
              },
            }),
          })
          if (isCurrent) setReviewLoad({ id: reviewId, review: result.review, error: '' })
        } catch (saveError) {
          if (isCurrent) {
            setReviewLoad({
              id: reviewId,
              review: null,
              error: saveError.message || 'Could not save this AI review for later.',
            })
          }
        }
      }
    }

    loadReview()
    return () => {
      isCurrent = false
    }
  }, [getToken, reviewId, state?.fileName, state?.rating])
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
    return (
      <main className="career-theme min-h-screen">
        <NewtonsCradle label="Loading your saved AI review" className="min-h-screen" />
      </main>
    )
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

  const scoreAccent = scoreColor(animatedScore)

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
      const result = await apiRequest('/extract-resume', {
        method: 'POST',
        body: JSON.stringify({ fileBase64: fileData, name: resumeFile.name, mimeType: resumeFile.type }),
      })
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

  async function deleteReview() {
    if (!reviewId) return

    setIsDeletingReview(true)
    setDeleteReviewError('')
    try {
      const token = await getToken()
      await apiRequest(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE', token })
      navigate('/reviews', { replace: true })
    } catch (error) {
      setDeleteReviewError(error.message || 'Could not delete this AI review.')
    } finally {
      setIsDeletingReview(false)
    }
  }

  return (
    <div className="career-theme min-h-screen text-[#1B342B]">
      <Header action="dashboard" />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8 md:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/reviews" className="inline-flex items-center gap-2 text-sm font-medium text-[#526158] transition-colors hover:text-[#1B342B]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> AI review history
          </Link>
          {reviewId && (
            <button
              type="button"
              onClick={deleteReview}
              disabled={isDeletingReview}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-rose-300 bg-[#FFFEFA] px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-[4px_4px_0_rgba(136,19,55,0.16)] transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {isDeletingReview ? 'Deleting review...' : 'Delete review'}
            </button>
          )}
        </div>
        {deleteReviewError && (
          <p role="alert" className="mb-5 rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {deleteReviewError}
          </p>
        )}

        <BorderGlow
          className="rounded-3xl text-[#F4F3E9] shadow-[0_24px_70px_-38px_rgba(27,52,43,0.7)]"
          edgeSensitivity={30}
          glowColor="95 55 65"
          backgroundColor="#1B342B"
          borderRadius={28}
          glowRadius={36}
          glowIntensity={0.7}
          coneSpread={25}
          colors={['#C5F26E', '#83AE40', '#A7C77C']}
          fillOpacity={0.18}
        >
          <div className="relative rounded-3xl p-5 sm:p-8 lg:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#83AE40]/15 blur-3xl" />
            <div className="relative">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[#F4F3E9]/60 sm:text-xs">HR manager’s academic CV review</p>
                <h1 className="mt-2 break-words text-lg font-semibold tracking-tight sm:text-xl">{state?.fileName || savedReview?.fileName || 'Your resume results'}</h1>
                {savedReview?.createdAt && <p className="mt-1 text-xs text-[#F4F3E9]/60">Reviewed {new Date(savedReview.createdAt).toLocaleString()}</p>}
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#C5F26E] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wide text-[#1B342B] sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Review ready
              </span>
            </div>

            <BorderGlow
              className="rounded-3xl"
              edgeSensitivity={30}
              glowColor="95 55 65"
              backgroundColor="#2C4A3E"
              borderRadius={28}
              glowRadius={32}
              glowIntensity={0.8}
              coneSpread={25}
              colors={['#C5F26E', '#83AE40', '#A7C77C']}
              fillOpacity={0.24}
            >
              <div className="rounded-3xl border border-white/10 bg-white/[0.09] p-5 shadow-inner shadow-white/[0.03] sm:p-7 lg:p-8">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F4F3E9]/65">Resume strength</p>
                    <p className="mt-2 flex items-baseline gap-1.5" aria-label={`Resume score ${rating.overall_score} out of 100`}>
                      <span className="text-6xl font-bold leading-none tracking-[-0.06em] tabular-nums sm:text-7xl" style={{ color: scoreAccent }}>{animatedScore}</span>
                      <span className="text-xl font-semibold text-[#F4F3E9]/65">/100</span>
                    </p>
                  </div>
                  <span className="pb-1 font-mono text-xs font-medium text-[#F4F3E9]/60">{rating.overall_score}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Resume strength"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={animatedScore}
                  className="resume-strength-meter h-2.5 overflow-hidden rounded-full bg-white/15"
                >
                  <div
                    className="h-full rounded-full transition-[width,background-color] duration-100 ease-out"
                    style={{ width: `${animatedScore}%`, backgroundColor: scoreAccent }}
                  />
                </div>
                <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-[#F4F3E9]/75 sm:text-base">{rating.verdict}</p>
              </div>
            </BorderGlow>
            <p className="mt-5 max-w-4xl text-xs leading-relaxed text-[#F4F3E9]/55">
              Scored using the supplied Academic CV Master Guide. The guide provides no numeric weights; category weights are derived from its priorities.
            </p>
            </div>
          </div>
        </BorderGlow>

        <ScrollRevealPanel
          eyebrow="Your results"
          title="Score breakdown"
          description="Points are awarded for evidence in your CV and deducted when relevant guide criteria are missing or unclear. Each category explains both sides of its score."
        >
          <div className="space-y-5">
            {rating.categories.map((category, index) => {
              const percent = category.max > 0 ? Math.min(category.score / category.max * 100, 100) : 0
              const pointsLost = category.max - category.score
              return (
                <article key={category.name} className="rounded-2xl border border-[#1B342B]/10 bg-white p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <h3 className="min-w-0 break-words font-semibold text-[#1B342B]">{category.name}</h3>
                    <span className="shrink-0 font-semibold tabular-nums text-[#2C4A3E]">{category.score} / {category.max}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#E9E9DF]">
                    <div className="h-full rounded-full bg-[#83AE40] transition-[width] duration-700 ease-out" style={{ width: `${categoriesVisible ? percent : 0}%`, transitionDelay: `${index * 70}ms` }} />
                  </div>
                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="font-medium text-[#42633A]">What earned points</p>
                      <p className="mt-1 leading-relaxed text-[#647168]">{category.evidence}</p>
                    </div>
                    <div>
                      <p className="font-medium text-[#8A642C]">Points not earned: {pointsLost}</p>
                      <p className="mt-1 leading-relaxed text-[#647168]">{category.points_lost_reason}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </ScrollRevealPanel>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {RATING_CARDS.map((card) => (
            <TiltedCard
              key={card.key}
              title={card.title}
              className="rounded-3xl border border-[#1B342B]/10 bg-[#FFFEFA] p-6 shadow-[0_12px_40px_-30px_rgba(27,52,43,0.38)]"
            >
              <div className="flex items-start gap-3">
                <span className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${card.background} ${card.color}`}>{card.title}</span>
              </div>
              <p className="mt-3 text-sm text-[#647168]">{card.description}</p>
              {rating[card.key].length === 0
                ? <p className="mt-4 text-sm text-[#647168]">{card.key === 'strengths' ? 'Keep building on the solid evidence in your CV.' : 'No major items identified in this area.'}</p>
                : card.key === 'next_steps'
                  ? <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed marker:font-semibold marker:text-[#567B42]">{rating[card.key].map((item, itemIndex) => <li key={`${card.key}-${itemIndex}`} className="ps-1 text-[#1B342B]">{item}</li>)}</ol>
                  : <ul className="mt-4 space-y-3">{rating[card.key].map((item, itemIndex) => <li key={`${card.key}-${itemIndex}`} className="flex gap-2 text-sm leading-relaxed"><span className={`mt-0.5 ${card.color}`} aria-hidden="true">•</span><span>{item}</span></li>)}</ul>}
            </TiltedCard>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {improveError && <p role="alert" className="text-sm text-destructive">{improveError}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={improveInBuilder} disabled={isImproving || !resumeFile} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1B342B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2C4A3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
              <Sparkles className="h-4 w-4" /> {isImproving ? 'Preparing your resume...' : 'Improve this in the Resume Builder'}
            </button>
            <button type="button" onClick={() => navigate('/home#rate-resume')} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1B342B]/15 bg-[#FFFEFA] px-5 py-3 text-sm font-semibold text-[#1B342B] transition hover:border-[#83AE40] hover:bg-[#EDF2E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] focus-visible:ring-offset-2">
              <FileUp className="h-4 w-4" /> Upload another resume
            </button>
            <button type="button" onClick={() => navigate('/reviews')} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1B342B]/15 bg-[#FFFEFA] px-5 py-3 text-sm font-semibold text-[#1B342B] transition hover:border-[#83AE40] hover:bg-[#EDF2E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] focus-visible:ring-offset-2">
              View AI review history
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RatingDashboard
