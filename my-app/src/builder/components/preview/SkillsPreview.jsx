import { SKILL_RATING_LABELS } from '../skillRatings.js'

function SkillsPreview({ skills, pageStart = 0, pageEnd = skills.length, showHeading = true }) {
  const visibleSkills = skills.slice(pageStart, pageEnd)

  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      {showHeading && <h2 className="resume-a4-section-heading mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase text-slate-900">Skills</h2>}
      <ul className="my-3 list-disc space-y-1 pl-6">
        {visibleSkills.map((skill, index) => {
          const rating = typeof skill === 'string' ? 0 : Number(skill.rating) || 0
          const ratingLabel = SKILL_RATING_LABELS[rating]
          return <li className="resume-a4-entry" key={pageStart + index}>{typeof skill === 'string' ? skill : skill.name}{ratingLabel && ` - ${ratingLabel}`}</li>
        })}
      </ul>
    </section>
  )
}

export default SkillsPreview
