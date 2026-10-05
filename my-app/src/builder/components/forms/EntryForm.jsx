import { Plus, Trash2 } from 'lucide-react'

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

function EntryForm({ title, description, addLabel, emptyIcon: EmptyIcon, emptyTitle, emptyHint, entries, fields, onAdd, onRemove, onChange, themeColor }) {
  return (
    <section className="mt-5 rounded-lg border-t-4 p-5 shadow-lg" style={{ borderColor: themeColor }}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-lg font-bold">{title}</h2><p className="text-sm text-slate-600">{description}</p></div>
        <button type="button" onClick={onAdd} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200"><Plus className="h-4 w-4" /> {addLabel}</button>
      </div>
      {entries.length === 0 && EmptyIcon && <div className="flex flex-col items-center gap-1 py-10 text-center text-slate-500"><EmptyIcon className="mb-2 h-12 w-12 text-slate-300" strokeWidth={1.5} /><p>{emptyTitle}</p><p className="text-sm">{emptyHint}</p></div>}
      <div className="mt-5 space-y-4">
        {entries.map((entry, index) => <div key={index} className="space-y-3 rounded-lg border border-slate-200 p-4">
          <div className="flex justify-end"><button type="button" onClick={() => onRemove(index)} aria-label={`Remove ${title.toLowerCase()} entry`} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
          {fields.map(([field, label, placeholder, inputType = 'text']) => {
            const dateValue = entry[field] || ''
            const useDateInput = inputType === 'text' && field.toLowerCase().includes('date') && (!dateValue || /^\d{4}-\d{2}-\d{2}$/.test(dateValue))
            return <label key={field} className="grid gap-1.5 text-xs text-slate-700">{label}{['details', 'description', 'workSummery'].includes(field) ? <textarea rows={3} value={dateValue} onChange={(event) => onChange(index, field, event.target.value)} placeholder={placeholder} className={inputClass} /> : <input type={useDateInput ? 'date' : inputType} value={dateValue} onChange={(event) => onChange(index, field, event.target.value)} placeholder={placeholder} className={inputClass} />}</label>
          })}
        </div>)}
      </div>
    </section>
  )
}

export default EntryForm
