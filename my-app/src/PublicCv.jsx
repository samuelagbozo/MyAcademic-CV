import { useCallback, useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { useParams } from 'react-router'
import ResumePreview from './builder/components/ResumePreview.jsx'
import { apiRequest } from './lib/api.js'

function PublicCv() {
  const { id } = useParams()
  const [resume, setResume] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true

    async function loadPublicResume() {
      setIsLoading(true)
      try {
        const result = await apiRequest(`/public/resumes/${encodeURIComponent(id)}`)
        if (isCurrent) {
          setResume({
            ...result.resume,
            experience: Array.isArray(result.resume?.experience) ? result.resume.experience : [],
            leadershipExperience: Array.isArray(result.resume?.leadershipExperience) ? result.resume.leadershipExperience : [],
            education: Array.isArray(result.resume?.education) ? result.resume.education : [],
            projects: Array.isArray(result.resume?.projects) ? result.resume.projects : [],
            skills: Array.isArray(result.resume?.skills) ? result.resume.skills : [],
            certifications: Array.isArray(result.resume?.certifications) ? result.resume.certifications : [],
            achievements: Array.isArray(result.resume?.achievements) ? result.resume.achievements : [],
            customSections: Array.isArray(result.resume?.customSections) ? result.resume.customSections : [],
            references: Array.isArray(result.resume?.references) ? result.resume.references : [],
          })
        }
      } catch {
        if (isCurrent) setResume(null)
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadPublicResume()
    return () => {
      isCurrent = false
    }
  }, [id])

  const downloadResume = useCallback(() => {
    const originalTitle = document.title
    const fullName = [resume?.firstName, resume?.middleName, resume?.lastName].filter(Boolean).join(' ').trim()
      || (resume?.fullName || '').trim()
    document.title = `${fullName || 'Resume'} - CV`
    window.addEventListener('afterprint', () => {
      document.title = originalTitle
    }, { once: true })
    window.print()
  }, [resume])

  if (isLoading) {
    return <main className="public-cv-page min-h-screen bg-white" aria-busy="true" />
  }

  if (!resume) {
    return (
      <main className="public-cv-page flex min-h-screen items-center justify-center bg-white px-6 text-center text-black">
        <p>This CV is not available.</p>
      </main>
    )
  }

  const fullName = [resume.firstName, resume.middleName, resume.lastName].filter(Boolean).join(' ').trim()
    || resume.fullName
    || 'CV'

  return (
    <main className="public-cv-page min-h-screen bg-[#F2EFE6] py-3 md:py-8 print:bg-white print:p-0">
      <div className="public-cv-toolbar mx-auto flex w-full max-w-[794px] justify-end px-3 pb-3 print:hidden md:px-0">
        <button type="button" onClick={downloadResume} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black shadow-sm">
          <Download className="h-4 w-4" aria-hidden="true" /> Download PDF
        </button>
      </div>
      <div className="mx-auto w-full max-w-[794px]">
        <ResumePreview resume={resume} previewMode="page" showControls={false} showAllPages />
      </div>
      <title>{`${fullName} - CV`}</title>
      <meta name="description" content={`View ${fullName}'s CV.`} />
      <meta property="og:title" content={`${fullName} - CV`} />
      <meta property="og:description" content={`View ${fullName}'s CV.`} />
    </main>
  )
}

export default PublicCv
