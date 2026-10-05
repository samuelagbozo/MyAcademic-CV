function SummaryPreview({ summary }) {
  return <section className="my-5 text-xs leading-relaxed sm:text-sm">
    <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-slate-900">Profile</h2>
    <p className="whitespace-pre-wrap">{summary}</p>
  </section>
}

export default SummaryPreview
