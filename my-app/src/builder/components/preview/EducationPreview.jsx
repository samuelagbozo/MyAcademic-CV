function EducationPreview({ education }) {
  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      <h2 className="mb-2 border-b border-slate-300 pb-1 text-left text-sm font-bold uppercase tracking-wide text-slate-900">Education</h2>
      {education.map((item, index) => (
        <div key={index} className="my-3">
          <h3 className="text-sm font-bold text-slate-900">{item.universityName || item.school}</h3>
          <p className="flex justify-between gap-3"><span>{[item.degree || item.qualification, item.major].filter(Boolean).join(' in ')}</span><span>{item.startDate}{item.startDate && (item.endDate || item.dates) ? ' - ' : ''}{item.endDate || item.dates}</span></p>
          {(item.description || item.details) && <p className="my-2 whitespace-pre-wrap">{item.description || item.details}</p>}
        </div>
      ))}
    </section>
  )
}

export default EducationPreview
