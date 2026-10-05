import { useState } from 'react'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router'
import FormSection from './components/FormSection.jsx'
import ResumePreview from './components/ResumePreview.jsx'

const STORAGE_KEY = 'resume-builder-resumes'

function createEmptyResume(id, title) {
  return {
    id,
    title: title || 'My Resume',
    firstName: '', lastName: '', fullName: '', email: '', phone: '', address: '', location: '', profession: '', jobTitle: '', linkedin: '', website: '',
    summary: '', photo: '', experience: [], education: [], projects: [], skills: [], achievements: [], references: [],
    themeColor: '#111827',
  }
}

function loadResume(id, title) {
  try {
    const resumes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const saved = resumes.find((resume) => resume.id === id)
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
      skills: Array.isArray(saved.skills)
        ? saved.skills.map((skill) => typeof skill === 'string' ? { name: skill, rating: 0 } : skill)
        : typeof saved.skills === 'string'
          ? saved.skills.split(',').map((skill) => skill.trim()).filter(Boolean).map((name) => ({ name, rating: 0 }))
          : [],
      achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
    }
  } catch {
    return createEmptyResume(id, title)
  }
}

function Builder() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { id } = useParams()
  const [resume, setResume] = useState(() => loadResume(id, state?.title))
  const [savedMessage, setSavedMessage] = useState('')

  function updateResume(updater) {
    setResume(updater)
    setSavedMessage('')
  }

  function saveResume() {
    try {
      const resumes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const existingIndex = resumes.findIndex((item) => item.id === id)
      if (existingIndex === -1) resumes.push(resume)
      else resumes[existingIndex] = resume
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes))
      setSavedMessage('Changes saved.')
    } catch {
      setSavedMessage('Could not save this resume in your browser.')
    }
  }

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

  return (
    <main className="min-h-screen bg-white px-4 py-4 text-slate-900 sm:px-8 sm:py-6 print:min-h-0 print:p-0">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-slate-700 bg-white px-5 py-3 sm:px-8 print:hidden">
        <button type="button" onClick={() => navigate('/home')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to My Resumes
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <span role="status" className="text-sm text-slate-500">{savedMessage}</span>
          <button type="button" onClick={shareResume} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button type="button" onClick={downloadResume} className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-200">
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 p-4 sm:gap-8 sm:p-6 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 lg:p-8 print:m-0 print:block print:p-0">
        <div className="min-w-0">
          <FormSection resume={resume} onChange={updateResume} onSave={saveResume} />
        </div>
        <section aria-label="Live resume preview" className="min-w-0 w-full print:static">
          <ResumePreview resume={resume} />
        </section>
      </div>
    </main>
  )
}

export default Builder
