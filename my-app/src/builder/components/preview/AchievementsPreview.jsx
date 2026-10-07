function AchievementsPreview({ achievements, pageStart = 0, pageEnd = achievements.length, showHeading = true }) {
  const visibleAchievements = achievements.slice(pageStart, pageEnd)

  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      {showHeading && <h2 className="resume-a4-section-heading mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase text-slate-900">Achievements</h2>}
      <div className="space-y-3">
        {visibleAchievements.map((item, index) => (
          <div className="resume-a4-entry" key={pageStart + index}>
            <p className="flex flex-wrap justify-between gap-x-3">
              <span className="min-w-0 font-semibold">{item.title || item.name}</span>
              <span className="min-w-0">{[item.organization, item.date].filter(Boolean).join(' | ')}</span>
            </p>
            {item.description && <p className="mt-1 whitespace-pre-wrap">{item.description}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

export default AchievementsPreview
