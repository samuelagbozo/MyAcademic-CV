import PersonalDetailPreview from './preview/PersonalDetailPreview.jsx'
import SummaryPreview from './preview/SummaryPreview.jsx'
import ExperiencePreview from './preview/ExperiencePreview.jsx'
import EducationPreview from './preview/EducationPreview.jsx'
import ProjectPreview from './preview/ProjectPreview.jsx'
import SkillsPreview from './preview/SkillsPreview.jsx'
import ReferencesPreview from './preview/ReferencesPreview.jsx'

function ResumePreview({ resume }) {
  const hasContent = Boolean(resume.firstName || resume.lastName || resume.fullName || resume.jobTitle || resume.summary || resume.experience.length || resume.education.length || resume.projects.length || resume.skills.length || resume.references?.length)

  return (
    <div id="resume-preview" className="min-h-[700px] bg-white px-8 py-10 text-slate-900 shadow-lg sm:px-12 lg:px-14 print:min-h-0 print:p-14 print:shadow-none">
      {!hasContent ? <p className="flex min-h-[560px] items-center justify-center text-xl text-slate-700 print:min-h-0">Resume Preview</p> : <>
        <PersonalDetailPreview resume={resume} />
        {resume.summary && <SummaryPreview summary={resume.summary} />}
        {resume.experience.length > 0 && <ExperiencePreview experience={resume.experience} themeColor={resume.themeColor} />}
        {resume.education.length > 0 && <EducationPreview education={resume.education} themeColor={resume.themeColor} />}
        {resume.projects.length > 0 && <ProjectPreview projects={resume.projects} themeColor={resume.themeColor} />}
        {resume.skills.length > 0 && <SkillsPreview skills={resume.skills} themeColor={resume.themeColor} />}
        {resume.references?.length > 0 && <ReferencesPreview references={resume.references} themeColor={resume.themeColor} />}
      </>}
    </div>
  )
}

export default ResumePreview
