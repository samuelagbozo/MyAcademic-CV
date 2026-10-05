function SkillsPreview({ skills }) {
  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      <h2 className="mb-2 border-b border-slate-300 pb-1 text-left text-sm font-bold uppercase tracking-wide text-slate-900">Skills</h2>
      <div className="my-3 flex flex-wrap gap-x-5 gap-y-1">
        {skills.map((skill, index) => <span key={index}>{typeof skill === 'string' ? skill : skill.name}</span>)}
      </div>
    </section>
  )
}

export default SkillsPreview
