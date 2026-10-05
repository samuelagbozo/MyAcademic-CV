const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200'

function SummaryForm({ value, onChange, themeColor }) {
  return (
    <section className="mt-5 rounded-lg border-t-4 p-5 shadow-lg" style={{ borderColor: themeColor }}>
      <h2 className="text-lg font-bold">Summary</h2>
      <p className="text-sm text-slate-600">Add summary for your job title</p>
      <label className="mt-7 block text-sm">Add Summary</label>
      <textarea name="summary" value={value} onChange={onChange} rows={8} className={`${inputClass} mt-3 resize-none`} />
      <p className="mt-2 text-xs text-slate-500">Add a short summary of your experience and career goals.</p>
    </section>
  )
}

export default SummaryForm
