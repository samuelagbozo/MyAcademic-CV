import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/react-router'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router'
import FormSection from './components/FormSection.jsx'
import ResumePreview from './components/ResumePreview.jsx'
import NewtonsCradle from '../components/ui/NewtonsCradle.jsx'
import { apiRequest } from '../lib/api.js'
import { sanitizeRichText } from './richText.js'
import { readPreviewMode, savePreviewMode } from './previewMode.js'

function createEmptyResume(id, title) {
  return {
    id,
    title: title || 'My Resume',
    firstName: '', middleName: '', lastName: '', fullName: '', email: '', phone: '', address: '', location: '', profession: '', jobTitle: '', linkedin: '', website: '',
    summary: '', photo: '', experience: [], leadershipExperience: [], education: [], projects: [], skills: [], certifications: [], achievements: [], customSections: [], references: [],
    themeColor: '#111827',
  }
}

function normalizeResume(saved, id, title) {
  if (!saved) return createEmptyResume(id, title)

  return {
      ...createEmptyResume(id, title),
      ...saved,
      firstName: saved.firstName || (saved.fullName || '').trim().split(/\s+/)[0] || '',
      lastName: saved.lastName || (saved.fullName || '').trim().split(/\s+/).slice(1).join(' '),
      jobTitle: saved.jobTitle || saved.profession || saved.professionalTitle || '',
      address: saved.address || saved.location || '',
      profession: saved.profession || saved.jobTitle || saved.professionalTitle || '',
      summary: saved.summary || saved.summery || '',
      experience: Array.isArray(saved.experience)
        ? saved.experience.map((entry) => ({
          ...entry,
          title: entry.title || entry.role || '',
          companyName: entry.companyName || entry.company || '',
          city: entry.city || '',
          state: entry.state || '',
          startDate: entry.startDate || '',
          endDate: entry.endDate || '',
          workSummery: entry.workSummery || entry.details || '',
        }))
        : saved.experience
          ? [{ title: saved.jobTitle || '', companyName: saved.company || '', city: '', state: '', startDate: '', endDate: '', workSummery: saved.experience }]
          : [],
      leadershipExperience: Array.isArray(saved.leadershipExperience)
        ? saved.leadershipExperience.map((entry) => ({
          ...entry,
          title: entry.title || entry.role || '',
          organization: entry.organization || entry.companyName || '',
          startDate: entry.startDate || '',
          endDate: entry.endDate || '',
          description: entry.description || entry.details || '',
        }))
        : [],
      education: Array.isArray(saved.education)
        ? saved.education.map((entry) => ({
          ...entry,
          institution: entry.institution || entry.universityName || entry.school || '',
          degree: entry.degree || entry.qualification || '',
          major: entry.major || '',
          startDate: entry.startDate || '',
          endDate: entry.endDate || entry.dates || '',
          description: entry.description || entry.details || '',
        }))
        : saved.qualification || saved.school || saved.educationDetails
          ? [{ universityName: saved.school || '', degree: saved.qualification || '', major: '', startDate: '', endDate: '', description: saved.educationDetails || '' }]
          : [],
      projects: Array.isArray(saved.projects) ? saved.projects : [],
      certifications: Array.isArray(saved.certifications) ? saved.certifications : [],
      skills: Array.isArray(saved.skills)
        ? saved.skills.map((skill) => typeof skill === 'string' ? { name: skill, rating: 0 } : skill)
        : typeof saved.skills === 'string'
          ? saved.skills.split(',').map((skill) => skill.trim()).filter(Boolean).map((name) => ({ name, rating: 0 }))
          : [],
      achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
      customSections: Array.isArray(saved.customSections)
        ? saved.customSections
          .filter((section) => section && typeof section === 'object' && !Array.isArray(section))
          .map((section) => ({
            id: typeof section.id === 'string' && section.id ? section.id : crypto.randomUUID(),
            title: typeof section.title === 'string' ? section.title : '',
            content: sanitizeRichText(typeof section.content === 'string' ? section.content : ''),
          }))
        : [],
  }
}

function Builder() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  const { id } = useParams()
  const [resume, setResume] = useState(() => normalizeResume(state?.resume, id, state?.title))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [previewMode, setPreviewMode] = useState(readPreviewMode)
  const [activeFormStep, setActiveFormStep] = useState(0)
  const resumeRef = useRef(resume)
  const revisionRef = useRef(0)
  const dirtyRef = useRef(false)
  const saveQueueRef = useRef(Promise.resolve())
  const saveCountRef = useRef(0)
  resumeRef.current = resume

  useEffect(() => {
    let isCurrent = true

    async function loadResume() {
      setIsLoading(true)
      try {
        const token = await getToken()
        const result = await apiRequest(`/resumes/${encodeURIComponent(id)}`, { token })
        if (isCurrent) setResume(normalizeResume(result.resume, id, state?.title))
      } catch (error) {
        if (isCurrent) setSavedMessage(error.message || 'Could not load this resume.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadResume()
    return () => {
      isCurrent = false
    }
  }, [getToken, id, state?.title])

  useEffect(() => {
    savePreviewMode(previewMode)
  }, [previewMode])

  useEffect(() => {
    if (isLoading || !state?.printOnLoad) return undefined
    const timer = window.setTimeout(() => window.print(), 250)
    return () => window.clearTimeout(timer)
  }, [isLoading, state?.printOnLoad])

  function updateResume(updater) {
    revisionRef.current += 1
    dirtyRef.current = true
    setIsDirty(true)
    setResume(updater)
    setSavedMessage('Unsaved changes')
  }

  const saveResume = useCallback(async (snapshot = resumeRef.current) => {
    const revision = revisionRef.current
    saveCountRef.current += 1
    setIsSaving(true)
    setSavedMessage('Saving...')
    const saveTask = saveQueueRef.current.then(async () => {
      const token = await getToken()
      await apiRequest(`/resumes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ resume: snapshot }),
      })
    })
    saveQueueRef.current = saveTask.catch(() => {})

    try {
      await saveTask
      if (revisionRef.current === revision) {
        dirtyRef.current = false
        setIsDirty(false)
        setSavedMessage('Saved')
      }
    } catch (error) {
      if (revisionRef.current === revision) {
        setSavedMessage(error.message || 'Could not save this resume.')
      }
    } finally {
      saveCountRef.current -= 1
      setIsSaving(saveCountRef.current > 0)
    }
  }, [getToken, id])

  useEffect(() => {
    if (!isDirty || isLoading) return undefined
    const timer = window.setTimeout(() => {
      void saveResume(resume)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [isDirty, isLoading, resume, saveResume])

  async function shareResume() {
    const resumeText = document.getElementById('resume-preview')?.innerText
    if (!resumeText) {
      setSavedMessage('Add resume details before sharing.')
      return
    }

    try {
      if (navigator.share) {
        await navigator.share({ title: resume.title || 'My Resume', text: resumeText })
        setSavedMessage('Resume shared.')
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resumeText)
        setSavedMessage('Resume copied to clipboard.')
      } else {
        setSavedMessage('Sharing is not available in this browser.')
      }
    } catch (error) {
      if (error.name !== 'AbortError') setSavedMessage('Could not share this resume.')
    }
  }

  function downloadResume() {
    const originalTitle = document.title
    document.title = ' '
    window.addEventListener('afterprint', () => {
      document.title = originalTitle
    }, { once: true })
    window.print()
  }

  if (isLoading) {
    return (
      <main className="career-theme min-h-screen">
        <NewtonsCradle label="Loading your saved resume" className="min-h-screen" />
      </main>
    )
  }

  return (
    <main className="career-theme min-h-screen px-4 py-4 text-[#1B342B] sm:px-8 sm:py-6 print:min-h-0 print:p-0">
      <header className="career-builder-header career-builder-toolbar flex min-h-16 flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-3 sm:px-8 print:hidden">
        <button type="button" onClick={() => navigate('/home')} className="career-form-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to My Resumes
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <span role="status" className="text-sm text-slate-500">{savedMessage || (isSaving ? 'Saving...' : '')}</span>
          <button type="button" onClick={shareResume} className="career-form-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <div role="group" aria-label="Resume preview mode" className="career-preview-toggle inline-flex rounded-lg border border-[#2C4A3E]/15 bg-[#F2EFE6] p-1">
            <button
              type="button"
              data-testid="preview-mode-continuous"
              aria-label="Continuous scroll"
              title="Continuous scroll"
              aria-pressed={previewMode === 'continuous'}
              onClick={() => setPreviewMode('continuous')}
              className={`rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] ${previewMode === 'continuous' ? 'bg-[#2C4A3E] text-white shadow-sm' : 'text-[#526158] hover:text-[#1B342B]'}`}
            >
              Continuous scroll
            </button>
            <button
              type="button"
              data-testid="preview-mode-page"
              aria-label="Page view"
              title="Page view"
              aria-pressed={previewMode === 'page'}
              onClick={() => setPreviewMode('page')}
              className={`rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] ${previewMode === 'page' ? 'bg-[#2C4A3E] text-white shadow-sm' : 'text-[#526158] hover:text-[#1B342B]'}`}
            >
              Page view
            </button>
          </div>
          <button type="button" onClick={downloadResume} className="career-form-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-200">
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 p-2 min-[360px]:p-3 sm:gap-8 sm:p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 lg:p-8 print:m-0 print:block print:p-0">
        <div className="min-w-0">
          <FormSection resume={resume} onChange={updateResume} onSave={saveResume} onStepChange={setActiveFormStep} isSaving={isSaving} />
        </div>
        <section aria-label="Live resume preview" className="career-preview-panel min-w-0 w-full rounded-2xl p-3 sm:p-4 print:static print:border-0 print:bg-transparent print:p-0 print:shadow-none">
          <ResumePreview resume={resume} previewMode={previewMode} activeFormStep={activeFormStep} />
        </section>
      </div>
    </main>
  )
}

export default Builder
