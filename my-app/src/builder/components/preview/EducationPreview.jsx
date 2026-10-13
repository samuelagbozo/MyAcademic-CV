import { memo } from 'react'
function EducationPreview({ education, pageStart = 0, pageEnd = education.length, showHeading = true }) {
  const visibleEducation = education.slice(pageStart, pageEnd)

  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      {showHeading && <h2 className="resume-a4-section-heading mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase text-slate-900">Education</h2>}
      {visibleEducation.map((item, index) => (
        <div key={pageStart + index} className="resume-a4-entry my-3">
          <h3 className="text-sm font-bold text-slate-900">{item.institution || item.universityName || item.school}</h3>
          <p className="flex flex-wrap items-baseline justify-between gap-x-3"><span className="min-w-0 flex-1">{[item.degree || item.qualification, item.major].filter(Boolean).join(' in ')}</span><span className="shrink-0">{item.startDate}{item.startDate && (item.endDate || item.dates) ? ' - ' : ''}{item.endDate || item.dates}</span></p>
          {(item.description || item.details) && <p className="my-2 whitespace-pre-wrap">{item.description || item.details}</p>}
        </div>
      ))}
    </section>
  )
}

export default memo(EducationPreview)
