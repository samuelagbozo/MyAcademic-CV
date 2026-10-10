import { Link } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Check,
  ShieldCheck,
  Sparkles,
  FileText,
  UserRound,
} from 'lucide-react'
import Header from '../components/Header.jsx'
import FlipText from '../components/FlipText.jsx'
import FolderFloat from '../components/FolderFloat.jsx'
import FlipCard from '../components/FlipCard.jsx'

const metrics = [
  { title: 'All in one place', detail: 'Your resumes and reviews', icon: FileText },
  { title: 'Clear next steps', detail: 'Useful AI feedback', icon: Sparkles },
  { title: 'Career-ready', detail: 'Built for your next move', icon: BriefcaseBusiness },
]

const highlights = [
  {
    title: 'Build with intention',
    description: 'Shape your experience into a clear, polished resume that reflects the work you want to do.',
    icon: BadgeCheck,
  },
  {
    title: 'Improve with useful feedback',
    description: 'Get an AI-powered review with practical suggestions to strengthen your story and presentation.',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Keep your momentum',
    description: 'Return to saved resumes and review history whenever your next opportunity comes along.',
    icon: ShieldCheck,
  },
]

function Welcome() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="welcome-page min-h-screen overflow-x-clip text-[#1B342B]">
      <Header action="get-started" />

      <main>
        <section className="relative z-0 min-w-0 px-4 pb-12 pt-16 sm:px-8 sm:pt-20 lg:pb-16 lg:pt-24">
          <div className="pointer-events-none absolute left-1/2 top-12 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#C5F26E]/20 blur-3xl" />
          <div className="relative mx-auto max-w-6xl">
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, filter: 'blur(12px)', y: 8 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: 'easeOut' }}
              className="mb-8 text-left text-2xl font-semibold tracking-tight text-[#1B342B] sm:text-3xl"
            >
              Welcome
            </motion.p>
          </div>
          <div className="relative mx-auto min-w-0 max-w-5xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#2C4A3E]/20 bg-white/70 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#2C4A3E] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#83AE40]" />
              Your next chapter, engineered
            </div>
            <h1 aria-label="Make your experience impossible to overlook" className="mx-auto mt-7 min-w-0 max-w-4xl break-words text-balance text-[clamp(2rem,9vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.045em] sm:text-6xl lg:text-7xl lg:leading-[1.03] lg:tracking-[-0.055em]">
              Make your experience <span className="text-[#567B42]"><span className="lg:hidden">impossible to overlook</span><span className="hidden lg:inline"><FlipText text="impossible to overlook" /></span></span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#526158] sm:text-lg sm:leading-8">
              Build a sharper resume, get thoughtful AI feedback, and keep your career materials ready for what comes next.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/auth/sign-up" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C5F26E] px-6 py-3 text-sm font-semibold text-[#1B342B] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#b9e85e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] focus-visible:ring-offset-2">
                Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6B776F]">A calmer way to build your next opportunity</p>
          </div>
        </section>

        <section aria-label="ResumeAI workspace preview" className="mx-auto max-w-6xl px-4 pb-14 sm:px-8 lg:pb-20">
          <div className="mb-3 flex justify-center">
            <FolderFloat items={metrics} label="Career toolkit" sublabel="3 highlights" />
          </div>

          <FlipCard
            className="welcome-builder-preview mt-3"
            ariaLabel="Resume builder and resume preview"
            back={
              <div className="resume-review-back">
                <div className="resume-review-back__topline">
                  <div className="resume-review-back__title">
                    <span className="resume-review-back__eyebrow">HR MANAGER’S ACADEMIC CV REVIEW</span>
                    <span className="resume-review-back__filename">Alex Morgan Rivers · Resume</span>
                  </div>
                  <span className="resume-review-back__badge"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> REVIEW READY</span>
                </div>
                <div className="resume-review-back__content">
                  <div className="resume-review-back__score">
                    <div className="resume-review-back__score-header">
                      <div>
                        <span className="resume-review-back__score-label">Resume strength</span>
                        <span className="resume-review-back__score-value">86<span>/100</span></span>
                      </div>
                      <span className="resume-review-back__score-percent">86%</span>
                    </div>
                    <div className="resume-review-back__progress" role="progressbar" aria-label="Sample resume strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={86}><span /></div>
                    <p>Well structured, focused, and easy to scan.</p>
                  </div>
                  <div className="resume-review-back__feedback">
                    <div className="resume-review-back__breakdown-heading">
                      <div>
                        <h2>Score breakdown</h2>
                        <p>Clear feedback to help your experience stand out.</p>
                      </div>
                      <span className="resume-review-back__category-score">8 / 10</span>
                    </div>
                    <div className="resume-review-back__category">
                      <div className="resume-review-back__category-title">
                        <span>Experience &amp; impact</span>
                        <span>Strong evidence</span>
                      </div>
                      <div className="resume-review-back__category-meter"><span /></div>
                    </div>
                    <ul>
                      <li><Check className="h-4 w-4" aria-hidden="true" /> Add measurable outcomes to project descriptions.</li>
                      <li><Check className="h-4 w-4" aria-hidden="true" /> Bring key design skills closer to the top.</li>
                    </ul>
                  </div>
                </div>
                <div className="resume-review-back__footer">
                  <span>FICTIONAL SAMPLE · FOR DISPLAY ONLY</span>
                  <span>Flip back to view the resume</span>
                </div>
              </div>
            }
          >
          <div id="product" className="welcome-builder-frame">
            <div className="welcome-builder-grid">
              <div className="welcome-builder-form">
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-[#526158]">
                    <span className="font-medium">Step 1 of 11: Personal Information</span>
                    <span className="font-mono">9%</span>
                  </div>
                  <div className="welcome-builder-progress"><span /></div>
                  <div className="mt-4 flex justify-end">
                    <span className="welcome-builder-secondary">Next <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                  </div>
                </div>

                <div className="welcome-builder-section">
                  <h2 className="text-lg font-bold text-[#1B342B]">Personal Detail</h2>
                  <p className="text-sm text-[#647168]">Get started with the basic information</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1B342B]/20 text-[#526158]"><UserRound className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="text-sm text-[#526158]">Upload user image</span>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-x-3 gap-y-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
                    {[
                      ['First Name', 'ALEX'],
                      ['Middle Name', 'MORGAN'],
                      ['Last Name', 'RIVERS'],
                      ['Job Title', 'Product Designer'],
                      ['Address', 'Portland, Oregon'],
                      ['Phone', '(503) 555-0148'],
                      ['Email', 'alex.rivers@example.com'],
                      ['LinkedIn Profile Link', 'linkedin.com/in/alexrivers'],
                      ['Personal Website Link', 'alexrivers.design'],
                    ].map(([label, value], index) => (
                      <div key={label} className={`${index === 3 || index === 4 || index > 6 ? 'col-span-2' : ''} min-w-0`}>
                        <p className="mb-1.5 truncate text-xs text-[#526158]">{label}</p>
                        <div className="welcome-builder-input">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex justify-end border-t border-[#1B342B]/10 pt-4">
                  <span className="welcome-builder-primary">Save Changes</span>
                </div>
              </div>

              <div className="welcome-builder-preview">
                <div className="welcome-builder-preview-switch">
                  <div>
                    <p className="text-sm font-semibold text-[#1B342B]">Preview mode</p>
                    <p className="mt-0.5 text-[10px] text-[#647168]">Choose continuous scrolling or a page-by-page view.</p>
                  </div>
                  <div className="welcome-builder-preview-toggle">
                    <span>Continuous scroll</span>
                    <span aria-current="true">Page view</span>
                  </div>
                </div>
                <div className="welcome-builder-paper">
                  <p className="mx-auto mb-2 max-w-xl font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#71806F]">Fictional sample profile · Alex Morgan Rivers</p>
                  <div className="mx-auto max-w-xl bg-white px-6 py-7 text-slate-900 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.35)] sm:px-9 sm:py-9" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  <header className="border-b border-slate-300 pb-4 text-center">
                    <h2 className="text-xl font-bold tracking-wide sm:text-2xl">ALEX MORGAN RIVERS</h2>
                    <p className="mt-1 text-[10px] font-medium leading-relaxed sm:text-xs">Product Designer</p>
                    <p className="mt-2 text-[10px] leading-relaxed sm:text-xs">PORTLAND, OR · (503) 555-0148 · alex.rivers@example.com</p>
                    <p className="text-[10px] leading-relaxed sm:text-xs">linkedin.com/in/alexrivers</p>
                  </header>

                  <section className="my-4 text-[10px] leading-relaxed sm:text-xs">
                    <h3 className="mb-1 border-y-2 border-black py-1 uppercase">Profile</h3>
                    <p>Product designer with a passion for making useful, approachable digital experiences. Combines user research, clear visual systems, and cross-functional collaboration to turn complex problems into products people love.</p>
                  </section>

                  <section className="my-4 text-[10px] leading-relaxed sm:text-xs">
                    <h3 className="mb-1 border-y-2 border-black py-1 uppercase">Education</h3>
                    <div className="my-2">
                      <h4 className="font-bold">North Coast School of Design, Portland, OR</h4>
                      <p className="flex flex-col justify-between gap-1 min-[400px]:flex-row min-[400px]:gap-2"><span className="min-w-0 break-words">Bachelor of Fine Arts in Communication Design</span><span className="shrink-0">2020 — 2024</span></p>
                    </div>
                  </section>

                  <section className="my-4 text-[10px] leading-relaxed sm:text-xs">
                    <h3 className="mb-1 border-y-2 border-black py-1 uppercase">Projects</h3>
                    <div className="my-2">
                      <h4 className="font-bold">Fieldnotes — Community Garden Planner</h4>
                      <p>Designed a mobile-first planning experience that helps neighborhood gardens coordinate volunteers, tools, and seasonal tasks.</p>
                    </div>
                    <div className="my-2">
                      <h4 className="font-bold">Open Table — Local Food Discovery</h4>
                      <p>Created a searchable directory that connects residents with independent restaurants and community food events.</p>
                    </div>
                  </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </FlipCard>

          <div className="welcome-toolkit mt-4">
              <div className="mx-auto max-w-5xl p-5 sm:p-8 lg:p-10">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#567B42]">A BETTER CAREER TOOLKIT</p>
              <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-[-0.04em] text-[#1B342B] sm:text-4xl">Good work deserves a great introduction.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#647168]">Bring your experience into focus with a workspace designed to help you create, refine, and keep moving.</p>

              <div id="how-it-works" className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {highlights.map(({ title, description, icon: Icon }, index) => (
                  <article key={title} id={index === 1 ? 'ai-review' : undefined} className="welcome-toolkit-item flex gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1B342B]/20 bg-[#C5F26E] text-[#1B342B] shadow-[2px_2px_0_#2C4A3E]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#1B342B]">{title}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#647168]">{description}</p>
                    </div>
                  </article>
                ))}
              </div>
              <Link to="/auth/sign-up" className="welcome-toolkit-action mt-8 inline-flex w-fit items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-[#1B342B]">
                Start building <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1B342B]/10 px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[#71806F] sm:px-6">
        ResumeAI · Built for your next move
      </footer>
    </div>
  )
}

export default Welcome
