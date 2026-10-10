import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { createPortal } from 'react-dom'
import { UserButton, useUser } from '@clerk/react-router'
import { FileText, HelpCircle, History, Menu, Sparkles, Upload, X } from 'lucide-react'
import { useLocation } from 'react-router'
import FontWeightText from './FontWeightText.jsx'
import { SlideTabs } from './ui/slide-tabs'
import ThemeToggle from './ThemeToggle.jsx'

const dashboardTabs = [
  { label: 'Dashboard', href: '/home' },
  { label: 'My resumes', href: '/resumes' },
  { label: 'AI reviews', href: '/reviews' },
]

function Header({ action }) {
  const { user } = useUser()
  const { pathname } = useLocation()
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [mobileNavPath, setMobileNavPath] = useState(null)
  const [helpPopoverPosition, setHelpPopoverPosition] = useState({ top: 16, left: 16, width: 352 })
  const isMobileNavOpen = mobileNavPath === pathname
  const helpPopoverRef = useRef(null)
  const headerRef = useRef(null)
  const helpTriggerRef = useRef(null)
  const helpCloseRef = useRef(null)
  const mobileMenuButtonRef = useRef(null)

  useEffect(() => {
    if (!isHelpOpen && !isMobileNavOpen) return undefined

    const previousOverflow = document.body.style.overflow
    if (isMobileNavOpen || isHelpOpen) {
      document.body.style.overflow = 'hidden'
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setIsHelpOpen(false)
        setMobileNavPath(null)
      }
    }

    function closeOnOutsideClick(event) {
      if (!headerRef.current?.contains(event.target) && !helpPopoverRef.current?.contains(event.target)) {
        setIsHelpOpen(false)
        setMobileNavPath(null)
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.body.style.overflow = previousOverflow
    }
  }, [isHelpOpen, isMobileNavOpen])

  useLayoutEffect(() => {
    if (!isHelpOpen) return undefined
    const mobileMenuButton = mobileMenuButtonRef.current

    function updatePopoverPosition() {
      if (window.matchMedia('(max-width: 767px)').matches) return
      const trigger = helpTriggerRef.current
      if (!trigger) return

      const bounds = trigger.getBoundingClientRect()
      const width = Math.min(352, window.innerWidth - 32)
      const maxHeight = Math.min(window.innerHeight - 32, window.innerHeight * 0.8)
      const maxTop = Math.max(16, window.innerHeight - maxHeight - 16)
      setHelpPopoverPosition({
        top: Math.max(16, Math.min(bounds.bottom + 12, maxTop)),
        left: Math.max(16, Math.min(bounds.right - width, window.innerWidth - width - 16)),
        width,
      })
    }

    updatePopoverPosition()
    window.addEventListener('resize', updatePopoverPosition)
    window.addEventListener('scroll', updatePopoverPosition, true)
    helpCloseRef.current?.focus()
    return () => {
      window.removeEventListener('resize', updatePopoverPosition)
      window.removeEventListener('scroll', updatePopoverPosition, true)
      if (helpTriggerRef.current?.isConnected) helpTriggerRef.current.focus()
      else mobileMenuButton?.focus()
    }
  }, [isHelpOpen])

  const helpPopover = isHelpOpen && createPortal(
    <>
      <button
        type="button"
        aria-label="Close help panel"
        className="career-help-backdrop fixed inset-0 z-[60] bg-black/15"
        onClick={() => setIsHelpOpen(false)}
      />
      <section
        ref={helpPopoverRef}
        id="resumeai-help"
        role="dialog"
        aria-labelledby="resumeai-help-title"
        style={helpPopoverPosition}
        className="career-help-popover fixed z-[70] max-h-[calc(100dvh-2rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-[#1B342B]/20 bg-[#FFFEFA] p-5 text-left shadow-xl shadow-slate-900/15"
      >
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="career-help-label font-mono text-xs font-semibold uppercase tracking-[0.14em]">How it works</p>
            <h2 id="resumeai-help-title" className="mt-1 break-words text-lg font-bold text-slate-900">Your career toolkit</h2>
          </div>
          <button
            ref={helpCloseRef}
            type="button"
            aria-label="Close help"
            onClick={() => setIsHelpOpen(false)}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 break-words text-sm leading-relaxed text-slate-500">
          ResumeAI helps you create, improve, and keep track of your resumes in one place.
        </p>
        <ul className="mt-4 space-y-3">
          <li className="flex min-w-0 gap-3">
            <span className="career-help-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF2E6] text-[#2C4A3E]">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 break-words text-sm leading-relaxed text-slate-600"><strong className="font-semibold text-slate-800">Build resumes</strong> from scratch, edit them, and find saved work under My resumes.</span>
          </li>
          <li className="flex min-w-0 gap-3">
            <span className="career-help-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF2E6] text-[#2C4A3E]">
              <Upload className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 break-words text-sm leading-relaxed text-slate-600"><strong className="font-semibold text-slate-800">Import a resume</strong> to extract its details and start editing.</span>
          </li>
          <li className="flex min-w-0 gap-3">
            <span className="career-help-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF2E6] text-[#2C4A3E]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 break-words text-sm leading-relaxed text-slate-600"><strong className="font-semibold text-slate-800">Get an AI review</strong> with a score, feedback, and suggested next steps.</span>
          </li>
          <li className="flex min-w-0 gap-3">
            <span className="career-help-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF2E6] text-[#2C4A3E]">
              <History className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 break-words text-sm leading-relaxed text-slate-600"><strong className="font-semibold text-slate-800">Revisit your work</strong> from My resumes and AI reviews in the top navigation.</span>
          </li>
        </ul>
        <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-500">
          AI suggestions are a starting point. Review them and make sure your resume details are accurate.
        </p>
      </section>
    </>,
    document.body,
  )

  return action === 'dashboard' ? (
    <>
        <header ref={headerRef} className="career-dashboard-header relative z-50 flex w-full items-center justify-between gap-2 border-b px-3 py-3 shadow-sm sm:gap-4 sm:px-6 sm:py-4 md:px-10">
          <Link to="/home" className="relative z-30 flex min-w-0 shrink items-center gap-2 sm:shrink-0" aria-label="My Academic CV home">
            <img src="/academic-cv-logo.png" alt="My Academic CV" className="brand-wordmark h-8 w-[140px] object-contain" />
          </Link>
          <div className="absolute left-1/2 hidden -translate-x-1/2 md:block">
            <SlideTabs
              tabs={dashboardTabs}
              ariaLabel="Main navigation"
              selectedHref={pathname.startsWith('/resume-rating') ? '/reviews' : pathname}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div>
              <button
                type="button"
                aria-label="About ResumeAI"
                aria-expanded={isHelpOpen}
                aria-controls="resumeai-help"
                title="What does ResumeAI do?"
                onClick={(event) => {
                  if (isHelpOpen) {
                    setIsHelpOpen(false)
                    return
                  }
                  helpTriggerRef.current = event.currentTarget
                  setIsHelpOpen(true)
                }}
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#1B342B]/15 text-[#526158] transition-colors hover:bg-[#C5F26E]/30 hover:text-[#1B342B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] sm:flex md:h-10 md:w-10"
              >
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <ThemeToggle className="hidden md:inline-flex" />
            <div className="flex items-center gap-2 border-l-0 pl-0 sm:gap-3 sm:border-l sm:border-[#1B342B]/15 sm:pl-4">
              <div className="hidden text-right lg:block">
                <p title={user?.fullName || user?.primaryEmailAddress?.emailAddress || undefined} className="max-w-40 truncate text-sm font-semibold leading-tight text-[#1B342B]">{user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Your account'}</p>
                <p className="mt-1 text-xs text-[#71806F]">Resume workspace</p>
              </div>
              <UserButton />
            </div>
            <button
              ref={mobileMenuButtonRef}
              type="button"
              className="relative z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[#1B342B]/15 text-[#1B342B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] md:hidden"
              aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-dashboard-navigation"
              onClick={() => setMobileNavPath(isMobileNavOpen ? null : pathname)}
            >
              {isMobileNavOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          {isMobileNavOpen && (
            <>
              <button type="button" aria-label="Close navigation menu" className="fixed inset-x-0 bottom-0 top-16 z-10 bg-black/20 md:hidden" onClick={() => setMobileNavPath(null)} />
              <nav id="mobile-dashboard-navigation" aria-label="Main navigation" className="career-mobile-nav absolute inset-x-4 top-full z-50 mt-2 grid max-h-[calc(100dvh-5rem)] gap-1 overflow-y-auto rounded-2xl border p-4 shadow-xl md:hidden">
              {dashboardTabs.map(({ label, href }) => (
                <Link
                  key={href}
                  to={href}
                  aria-current={pathname === href || (href === '/reviews' && pathname.startsWith('/resume-rating')) ? 'page' : undefined}
                  className="flex min-h-11 items-center rounded-xl px-3 py-3 text-sm font-semibold text-[#1B342B] hover:bg-[#EDF2E6]"
                >
                  {label}
                </Link>
              ))}
              <button type="button" onClick={(event) => {
                helpTriggerRef.current = event.currentTarget
                setMobileNavPath(null)
                setIsHelpOpen(true)
              }} className="flex min-h-11 items-center rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#1B342B] hover:bg-[#EDF2E6] md:hidden">
                About ResumeAI
              </button>
              <ThemeToggle showLabel className="w-full justify-start rounded-xl border-0 px-3 text-left text-sm font-semibold hover:bg-[#EDF2E6] dark:hover:bg-white/10" />
              </nav>
            </>
          )}
        </header>
      {helpPopover}
    </>
  ) : (
        <header ref={headerRef} className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-[#1B342B]/10 bg-[#F2EFE6]/95 px-3 py-2.5 backdrop-blur sm:gap-4 sm:px-8 sm:py-3 lg:gap-0 lg:px-12">
          <Link to="/" aria-label="My Academic CV home" className="relative z-30 flex min-w-0 shrink items-center gap-2 sm:shrink-0">
            <img src="/academic-cv-logo.png" alt="My Academic CV" className="brand-wordmark h-8 w-[140px] object-contain" />
          </Link>
          <nav aria-label="Landing page" className="hidden items-center gap-7 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#526158] md:flex">
            <a href="/" className="transition hover:text-[#1B342B]">Home</a>
            <a href="#product" className="transition hover:text-[#1B342B]">Platform</a>
            <a href="#how-it-works" className="transition hover:text-[#1B342B]">Features</a>
            <a href="#ai-review" className="transition hover:text-[#1B342B]">AI review</a>
          </nav>
          <ThemeToggle className="hidden md:inline-flex" />
          <Link to="/auth/sign-in" aria-label="Sign in" className="get-started-link relative z-30 inline-flex min-h-11 shrink-0 items-center rounded-full bg-[#1B342B] px-2.5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#2C4A3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] focus-visible:ring-offset-2 sm:px-5 sm:text-sm lg:min-h-0 lg:inline">
            <FontWeightText text="Sign in ↗" />
          </Link>
          <button
            type="button"
            className="relative z-30 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#1B342B]/20 text-[#1B342B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] md:hidden"
            aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-landing-navigation"
            onClick={() => setMobileNavPath(isMobileNavOpen ? null : pathname)}
          >
            {isMobileNavOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
          {isMobileNavOpen && (
            <>
              <button type="button" aria-label="Close navigation menu" className="fixed inset-0 z-10 bg-black/20 backdrop-blur-[1px] md:hidden" onClick={() => setMobileNavPath(null)} />
              <nav id="mobile-landing-navigation" aria-label="Landing page" className="career-mobile-nav landing-mobile-nav absolute inset-x-3 top-full z-50 mt-2 grid gap-1 rounded-2xl border p-2 shadow-xl md:hidden">
              <a href="/" onClick={() => setMobileNavPath(null)} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#1B342B] hover:bg-[#EDF2E6]">Home</a>
              <a href="/#product" onClick={() => setMobileNavPath(null)} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#1B342B] hover:bg-[#EDF2E6]">Platform</a>
              <a href="/#how-it-works" onClick={() => setMobileNavPath(null)} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#1B342B] hover:bg-[#EDF2E6]">Features</a>
              <a href="/#ai-review" onClick={() => setMobileNavPath(null)} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#1B342B] hover:bg-[#EDF2E6]">AI review</a>
              <ThemeToggle showLabel className="w-full justify-start rounded-xl border-0 px-3 text-left text-sm font-semibold hover:bg-[#EDF2E6] dark:hover:bg-white/10" />
              </nav>
            </>
          )}
        </header>
  )
}

export default Header
