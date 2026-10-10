import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react-router'
import { ArrowLeft, Clock3, FileSearch, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import Header from './components/Header.jsx'
import NewtonsCradle from './components/ui/NewtonsCradle.jsx'
import { apiRequest } from './lib/api.js'

const DUST_PARTICLES = Array.from({ length: 72 }, (_, index) => {
  const random = (seed) => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
    return value - Math.floor(value)
  }
  const x = random(index + 1) * 100
  const y = random(index + 73) * 100
  const drift = 24 + random(index + 149) * 110
  const direction = (random(index + 211) - 0.5) * 150

  return {
    '--dust-x': `${x}%`,
    '--dust-y': `${y}%`,
    '--dust-size': `${2 + random(index + 283) * 4}px`,
    '--dust-delay': `${random(index + 337) * 320}ms`,
    '--dust-dx': `${drift}px`,
    '--dust-dy': `${direction}px`,
    '--dust-turn': `${(random(index + 401) - 0.5) * 300}deg`,
    '--dust-tone': random(index + 463) > 0.7 ? '#C5F26E' : random(index + 503) > 0.45 ? '#83AE40' : '#FFFEFA',
  }
})

function scoreColor(score) {
  if (score < 50) return 'text-rose-700 bg-rose-50'
  if (score < 75) return 'text-[#795C20] bg-[#F8F0D8]'
  return 'text-[#42633A] bg-[#EDF2E6]'
}

function AIReviewHistory() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [removingId, setRemovingId] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadReviews() {
      try {
        const token = await getToken()
        const result = await apiRequest('/reviews', { token })
        if (isCurrent) setReviews(result.reviews)
      } catch (loadError) {
        if (isCurrent) setError(loadError.message || 'Could not load your AI review history.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadReviews()
    return () => {
      isCurrent = false
    }
  }, [getToken])

  async function deleteReview(reviewId) {
    if (!reviewId) {
      setError('This saved AI review has no identifier and cannot be deleted.')
      return
    }

    setDeletingId(reviewId)
    setError('')
    try {
      const token = await getToken()
      await apiRequest(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE', token })
      setRemovingId(reviewId)
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete this AI review.')
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
            <h1 className="text-3xl font-bold tracking-tight text-[#1B342B] sm:text-4xl">AI review history</h1>
            <p className="mt-2 text-sm text-[#647168]">Review scores and recommendations from your previous CV assessments.</p>
          </div>
          <span className="rounded-full border border-[#1B342B]/20 bg-[#FFFEFA] px-3.5 py-2 text-xs font-medium text-[#526158] shadow-[3px_3px_0_rgba(44,74,62,0.16)]">
            {isLoading ? <NewtonsCradle label="Loading AI reviews" size={24} /> : `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`}
          </span>
        </section>

        {error && <p role="alert" className="mb-5 rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-[4px_4px_0_rgba(136,19,55,0.12)]">{error}</p>}
        {isLoading && <div className="rounded-xl border-2 border-[#1B342B] bg-[#FFFEFA] py-5 shadow-[5px_5px_0_#2C4A3E]"><NewtonsCradle label="Loading your AI reviews" /></div>}

        {!isLoading && reviews.length === 0 && (
          <section className="rounded-2xl border-2 border-dashed border-[#2C4A3E]/50 bg-[#FFFEFA] px-6 py-16 text-center shadow-[5px_5px_0_rgba(44,74,62,0.18)]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF2E6] text-[#2C4A3E]">
              <FileSearch className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-[#1B342B]">No AI reviews yet</h2>
            <p className="mt-2 text-sm text-[#647168]">Rate a PDF or DOCX resume and its result will appear here.</p>
            <Link to="/home#rate-resume" className="career-raised-button mt-5 inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold">
              Rate a resume
            </Link>
          </section>
        )}

        <div className="space-y-4">
          {!isLoading && reviews.map((review) => {
            const reviewId = review.id || review.reviewId
            const isRemoving = removingId === reviewId
            return (
              <div
                key={reviewId || review.fileName}
                className="review-history-dismiss"
                data-removing={isRemoving || undefined}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget || event.animationName !== 'review-history-dismiss') return
                  setReviews((current) => current.filter((item) => (item.id || item.reviewId) !== reviewId))
                  setRemovingId('')
                }}
              >
              {isRemoving && (
                <div className="review-dust-cloud" aria-hidden="true">
                  {DUST_PARTICLES.map((particle, index) => (
                    <span key={index} style={particle} />
                  ))}
                </div>
              )}
              <article aria-hidden={isRemoving || undefined} inert={isRemoving || undefined} className="career-review-history-card flex flex-col gap-4 rounded-2xl p-5 transition sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate(`/resume-rating/${encodeURIComponent(reviewId)}`)}
                  disabled={!reviewId}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] disabled:cursor-not-allowed"
                >
                  <span className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl ${scoreColor(review.rating.overall_score)}`}>
                    <span className="text-xl font-bold leading-none">{review.rating.overall_score}</span>
                    <span className="mt-1 text-[10px] font-medium">/ 100</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span title={review.fileName} className="block truncate font-semibold text-[#1B342B]">{review.fileName}</span>
                    <span className="mt-1 line-clamp-2 block text-sm text-[#647168]">{review.rating.verdict}</span>
                    <span className="mt-2 flex items-center gap-1.5 text-xs text-[#71806F]">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {new Date(review.createdAt).toLocaleString()}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/resume-rating/${encodeURIComponent(reviewId)}`)}
                    disabled={!reviewId}
                    className="career-raised-button rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    View review
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReview(reviewId)}
                    disabled={!reviewId || deletingId === reviewId || isRemoving}
                    aria-label={`Delete review for ${review.fileName}`}
                    className="trash-action rounded-lg border-2 border-[#1B342B]/20 bg-[#FFFEFA] p-2.5 text-[#526158] shadow-[3px_3px_0_rgba(44,74,62,0.14)] transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-50"
                  >
                    <Trash2 className="trash-icon h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default AIReviewHistory
