import { ArrowUpRight, Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import ThemeToggle from '../components/ThemeToggle.jsx'

function AuthPageLayout({ children, mode }) {
  const isSignUp = mode === 'sign-up'

  return (
    <main className="auth-page">
      <div className="auth-page__glow auth-page__glow--one" aria-hidden="true" />
      <div className="auth-page__glow auth-page__glow--two" aria-hidden="true" />
      <section className="auth-shell" aria-label={isSignUp ? 'Create your ResumeAI account' : 'Sign in to ResumeAI'}>
        <aside className="auth-story">
          <Link to="/" aria-label="My Academic CV home" className="auth-story__brand">
            <img src="/academic-cv-logo.png" alt="My Academic CV" className="brand-wordmark h-10 w-40 object-contain" />
          </Link>
          <div className="auth-story__copy">
            <span className="auth-story__eyebrow"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Your career toolkit</span>
            <h1>{isSignUp ? 'Make your next move count.' : 'Welcome back to your next chapter.'}</h1>
            <p>{isSignUp
              ? 'Build a resume that tells your story clearly, then refine it with feedback that helps you move forward.'
              : 'Pick up where you left off and keep your resumes and review feedback ready for what comes next.'}</p>
            <ul className="auth-story__benefits">
              <li><Check aria-hidden="true" /> Create and manage polished resumes</li>
              <li><Check aria-hidden="true" /> Get practical AI-powered feedback</li>
              <li><Check aria-hidden="true" /> Keep your progress in one workspace</li>
            </ul>
          </div>
          <div className="auth-story__preview" aria-hidden="true">
            <div className="auth-story__preview-top">
              <span className="auth-story__preview-dot" />
              <span>RESUME STRENGTH</span>
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="auth-story__preview-score">86<span>/100</span></div>
            <div className="auth-story__preview-meter"><span /></div>
            <div className="auth-story__preview-note">A clearer story. A stronger next step.</div>
            <ArrowUpRight className="auth-story__preview-arrow h-5 w-5" />
          </div>
          <span className="auth-story__footnote">A calmer way to build your next opportunity</span>
        </aside>
        <div className="auth-panel">
          <div className="auth-panel__theme">
            <ThemeToggle />
          </div>
          <div className="auth-page__content">{children}</div>
        </div>
      </section>
    </main>
  )
}

export default AuthPageLayout
