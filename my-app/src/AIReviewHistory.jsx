import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react-router'
import { ArrowLeft, Clock3, FileSearch, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import Header from './components/Header.jsx'
import { apiRequest } from './lib/api.js'

function scoreColor(score) {
  if (score < 50) return 'text-rose-600 bg-rose-50'
  if (score < 75) return 'text-amber-700 bg-amber-50'
  return 'text-emerald-700 bg-emerald-50'
}

function AIReviewHistory() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

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
    setDeletingId(reviewId)
    setError('')
    try {
      const token = await getToken()
      await apiRequest(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE', token })
      setReviews((current) => current.filter((review) => review.id !== reviewId))
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete this AI review.')
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">AI review history</h1>
            <p className="mt-2 text-sm text-slate-500">Review scores and recommendations from your previous CV assessments.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-500">
            {isLoading ? 'Loading...' : `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`}
          </span>
        </section>

        {error && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {isLoading && <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Loading your AI reviews...</p>}

        {!isLoading && reviews.length === 0 && (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <FileSearch className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No AI reviews yet</h2>
            <p className="mt-2 text-sm text-slate-500">Rate a PDF or DOCX resume and its result will appear here.</p>
            <Link to="/home#rate-resume" className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
              Rate a resume
            </Link>
          </section>
        )}

        <div className="space-y-4">
          {!isLoading && reviews.map((review) => (
            <article key={review.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate(`/resume-rating/${encodeURIComponent(review.id)}`)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl ${scoreColor(review.rating.overall_score)}`}>
                  <span className="text-xl font-bold leading-none">{review.rating.overall_score}</span>
                  <span className="mt-1 text-[10px] font-medium">/ 100</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-900">{review.fileName}</span>
                  <span className="mt-1 line-clamp-2 block text-sm text-slate-500">{review.rating.verdict}</span>
                  <span className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {new Date(review.createdAt).toLocaleString()}
                  </span>
                </span>
              </button>
              <div className="flex items-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/resume-rating/${encodeURIComponent(review.id)}`)}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  View review
                </button>
                <button
                  type="button"
                  onClick={() => deleteReview(review.id)}
                  disabled={deletingId === review.id}
                  aria-label={`Delete review for ${review.fileName}`}
                  className="trash-action rounded-lg border border-slate-200 p-2.5 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                >
                  <Trash2 className="trash-icon h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

export default AIReviewHistory
