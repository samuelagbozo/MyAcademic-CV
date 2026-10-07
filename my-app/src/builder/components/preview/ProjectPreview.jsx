function ProjectPreview({ projects, pageStart = 0, pageEnd = projects.length, showHeading = true }) {
  const visibleProjects = projects.slice(pageStart, pageEnd)

  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      {showHeading && <h2 className="resume-a4-section-heading mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase text-slate-900">Projects</h2>}
      {visibleProjects.map((item, index) => <div key={pageStart + index} className="resume-a4-entry my-3"><h3 className="text-sm font-bold text-slate-900">{item.name}</h3>{item.link && <p>{item.link}</p>}<p className="my-1 whitespace-pre-wrap">{item.details}</p></div>)}
    </section>
  )
}

export default ProjectPreview
