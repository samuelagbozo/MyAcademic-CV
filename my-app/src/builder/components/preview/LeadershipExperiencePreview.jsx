import { memo } from 'react'
function LeadershipExperiencePreview({ experiences, pageStart = 0, pageEnd = experiences.length, showHeading = true }) {
  const visibleExperiences = experiences.slice(pageStart, pageEnd)

  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      {showHeading && <h2 className="resume-a4-section-heading mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase text-slate-900">Leadership Experience</h2>}
      {visibleExperiences.map((item, index) => (
        <div key={pageStart + index} className="resume-a4-entry my-3">
          <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
          <p className="flex flex-wrap justify-between gap-x-3">
            <span className="min-w-0">{item.organization}</span>
            <span className="min-w-0">{item.startDate}{item.startDate && (item.endDate || 'Present') ? ' To ' : ''}{item.endDate || (item.startDate ? 'Present' : '')}</span>
          </p>
          {item.description && <p className="my-2 whitespace-pre-wrap">{item.description}</p>}
        </div>
      ))}
    </section>
  )
}

export default memo(LeadershipExperiencePreview)
