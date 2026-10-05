function ReferencesPreview({ references }) {
  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      <h2 className="mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase text-slate-900">References</h2>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {references.map((reference, index) => (
          <div key={`${reference.email || reference.name}-${index}`} className="text-sm text-slate-700">
            {reference.name && <p className="font-semibold">{reference.name}</p>}
            {reference.organization && <p>{reference.organization}</p>}
            {reference.email && <p>{reference.email}</p>}
            {reference.telephone && <p>{reference.telephone}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

export default ReferencesPreview
