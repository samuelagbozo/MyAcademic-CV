import { memo } from 'react'
function PersonalDetailPreview({ resume }) {
  const name = [resume.firstName, resume.middleName, resume.lastName].filter(Boolean).join(' ') || resume.fullName || 'Your Name'
  const address = resume.address || resume.location
  const title = resume.jobTitle || resume.profession

  return (
    <div className="border-b border-slate-300 pb-4 text-center">
      {resume.photo && (
        <img
          src={resume.photo}
          alt={`${name} profile`}
          className="mx-auto mb-3 h-16 w-16 rounded-full object-cover"
        />
      )}
      <h2 className="text-2xl font-bold tracking-wide text-slate-950 sm:text-3xl">{name}</h2>
      {title && <h3 className="mt-1 text-sm font-medium text-slate-700">{title}</h3>}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-700 sm:text-sm">
        {address && <span>{address}</span>}
        {resume.phone && <span>{resume.phone}</span>}
        {resume.email && <span>{resume.email}</span>}
        {resume.linkedin && <span>{resume.linkedin}</span>}
        {resume.website && <span>{resume.website}</span>}
      </div>
    </div>
  )
}

export default memo(PersonalDetailPreview)
