import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { UserButton, useUser } from '@clerk/react-router'
import { Bot, FileText, HelpCircle, History, Sparkles, Upload, X } from 'lucide-react'
import { useLocation } from 'react-router'
import FontWeightText from './FontWeightText.jsx'

function Header({ action }) {
  const { user } = useUser()
  const { pathname } = useLocation()
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const helpRef = useRef(null)

  useEffect(() => {
    if (!isHelpOpen) return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsHelpOpen(false)
    }

    function closeOnOutsideClick(event) {
      if (!helpRef.current?.contains(event.target)) setIsHelpOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('mousedown', closeOnOutsideClick)
    }
  }, [isHelpOpen])

  return action === 'dashboard' ? (
        <header className="career-dashboard-header relative z-10 flex w-full items-center justify-between border-b px-6 py-4 shadow-sm md:px-10">
          <div className="flex items-center gap-8">
            <Link to="/home" className="flex items-center gap-2 text-xl font-bold tracking-tight" aria-label="ResumeAI home">
              <span className="brand-logo flex h-9 w-9 items-center justify-center rounded-xl bg-[#2C4A3E] text-[#C5F26E] shadow-sm">
                <Bot className="brand-bot h-5 w-5" aria-hidden="true" />
              </span>
              ResumeAI
            </Link>
            <nav aria-label="Main navigation" className="hidden items-center gap-6 text-sm font-medium sm:flex">
              <Link to="/home" className={`border-b-2 py-5 transition-colors ${pathname === '/home' ? 'border-[#83AE40] text-[#1B342B]' : 'border-transparent text-[#647168] hover:text-[#1B342B]'}`}>Dashboard</Link>
              <Link to="/resumes" className={`border-b-2 py-5 transition-colors ${pathname === '/resumes' ? 'border-[#83AE40] text-[#1B342B]' : 'border-transparent text-[#647168] hover:text-[#1B342B]'}`}>My resumes</Link>
              <Link to="/reviews" className={`border-b-2 py-5 transition-colors ${pathname === '/reviews' || pathname.startsWith('/resume-rating') ? 'border-[#83AE40] text-[#1B342B]' : 'border-transparent text-[#647168] hover:text-[#1B342B]'}`}>AI reviews</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div ref={helpRef} className="relative">
              <button
                type="button"
                aria-label="About ResumeAI"
                aria-expanded={isHelpOpen}
                aria-controls="resumeai-help"
                title="What does ResumeAI do?"
                onClick={() => setIsHelpOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1B342B]/15 text-[#526158] transition-colors hover:bg-[#C5F26E]/30 hover:text-[#1B342B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40]"
              >
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
              </button>
              {isHelpOpen && (
                <section
                  id="resumeai-help"
                  role="dialog"
                  aria-labelledby="resumeai-help-title"
                  className="absolute right-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-[#1B342B]/10 bg-[#FFFEFA] p-5 text-left shadow-xl shadow-slate-900/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">How it works</p>
                      <h2 id="resumeai-help-title" className="mt-1 text-lg font-bold text-slate-900">Your career toolkit</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="Close help"
                      onClick={() => setIsHelpOpen(false)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    ResumeAI helps you create, improve, and keep track of your resumes in one place.
                  </p>
                  <ul className="mt-4 space-y-3">
                    <li className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-relaxed text-slate-600"><strong className="font-semibold text-slate-800">Build resumes</strong> from scratch, edit them, and find saved work under My resumes.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <Upload className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-relaxed text-slate-600"><strong className="font-semibold text-slate-800">Import a resume</strong> to extract its details and start editing.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-relaxed text-slate-600"><strong className="font-semibold text-slate-800">Get an AI review</strong> with a score, feedback, and suggested next steps.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <History className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-relaxed text-slate-600"><strong className="font-semibold text-slate-800">Revisit your work</strong> from My resumes and AI reviews in the top navigation.</span>
                    </li>
                  </ul>
                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-400">
                    AI suggestions are a starting point. Review them and make sure your resume details are accurate.
                  </p>
                </section>
              )}
            </div>
            <div className="flex items-center gap-3 border-l border-[#1B342B]/15 pl-4">
              <div className="hidden text-right lg:block">
                <p className="max-w-40 truncate text-sm font-semibold leading-tight text-[#1B342B]">{user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Your account'}</p>
                <p className="mt-1 text-xs text-[#71806F]">Resume workspace</p>
              </div>
              <UserButton />
            </div>
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#1B342B]/10 bg-[#F2EFE6]/95 px-5 py-3 backdrop-blur sm:px-8 lg:px-12">
          <Link to="/" aria-label="ResumeAI home" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-[#1B342B]">
            <span className="brand-logo flex h-9 w-9 items-center justify-center rounded-xl bg-[#2C4A3E] text-[#C5F26E] shadow-sm">
              <Bot className="brand-bot h-5 w-5" aria-hidden="true" />
            </span>
            ResumeAI
          </Link>
          <nav aria-label="Landing page" className="hidden items-center gap-7 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#526158] md:flex">
            <a href="/" className="transition hover:text-[#1B342B]">Home</a>
            <a href="#product" className="transition hover:text-[#1B342B]">Platform</a>
            <a href="#how-it-works" className="transition hover:text-[#1B342B]">Features</a>
            <a href="#ai-review" className="transition hover:text-[#1B342B]">AI review</a>
          </nav>
          <Link to="/auth/sign-in" aria-label="Sign in" className="get-started-link rounded-full bg-[#1B342B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2C4A3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] focus-visible:ring-offset-2">
            <FontWeightText text="Sign in ↗" />
          </Link>
        </header>
  )
}

export default Header
