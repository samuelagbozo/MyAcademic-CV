import { memo } from 'react'
function PersonalDetailPreview({ resume }) {
  const name = [resume.firstName, resume.middleName, resume.lastName].filter(Boolean).join(' ') || resume.fullName || 'Your Name'
  const address = resume.address || resume.location
  const title = resume.jobTitle || resume.profession

  return (
    <div className="resume-personal-header border-b border-slate-300 pb-4 text-center">
      {resume.photo && (
        <img
          src={resume.photo}
          alt={`${name} profile`}
          className="mx-auto mb-3 h-16 w-16 rounded-full object-cover"
        />
      )}
      <h2 className="resume-header-name block w-full text-2xl font-bold tracking-wide text-slate-950 sm:text-3xl">{name.trim()}</h2>
      {title && <h3 className="resume-header-title mt-1 w-full text-sm font-medium text-slate-700">{title}</h3>}
      <div className="resume-header-contact mt-3 flex flex-col items-center gap-y-1 text-xs text-slate-700 sm:text-sm">
        {address && <span className="w-full text-center">{address}</span>}
        {(resume.phone || resume.email) && <div className="flex justify-center gap-x-4 whitespace-nowrap">
          {resume.phone && <span>{resume.phone}</span>}
          {resume.email && <span>{resume.email}</span>}
        </div>}
        {resume.linkedin && <span className="w-full break-all text-center">{resume.linkedin}</span>}
        {resume.website && <span className="w-full break-all text-center">{resume.website}</span>}
      </div>
    </div>
  )
}

export default memo(PersonalDetailPreview)
