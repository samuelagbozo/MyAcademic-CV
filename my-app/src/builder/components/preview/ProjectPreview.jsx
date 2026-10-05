function ProjectPreview({ projects }) {
  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      <h2 className="mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase text-slate-900">Projects</h2>
      {projects.map((item, index) => <div key={index} className="my-3"><h3 className="text-sm font-bold text-slate-900">{item.name}</h3>{item.link && <p>{item.link}</p>}<p className="my-1 whitespace-pre-wrap">{item.details}</p></div>)}
    </section>
  )
}

export default ProjectPreview
