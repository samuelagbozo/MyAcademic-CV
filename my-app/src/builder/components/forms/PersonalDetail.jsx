import { UserRound } from 'lucide-react'

function PersonalDetail({ resume, onChange, onPhoto, themeColor }) {
  return (
    <section className="mt-5 rounded-lg border-t-4 p-5 shadow-lg" style={{ borderColor: themeColor }}>
      <h2 className="text-lg font-bold">Personal Detail</h2>
      <p className="text-sm text-slate-600">Get started with the basic information</p>
      <label className="mt-5 inline-flex cursor-pointer items-center gap-3">
        {resume.photo ? <img src={resume.photo} alt="Profile" className="h-12 w-12 rounded-full object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 text-slate-500"><UserRound className="h-5 w-5" /></span>}
        <span className="text-slate-700 hover:underline">{resume.photo ? 'Change user image' : 'Upload user image'}</span>
        <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
      </label>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Field label="First Name" name="firstName" value={resume.firstName} onChange={onChange} />
        <Field label="Last Name" name="lastName" value={resume.lastName} onChange={onChange} />
        <Field className="col-span-2" label="Job Title" name="jobTitle" value={resume.jobTitle || resume.profession} onChange={onChange} />
        <Field className="col-span-2" label="Address" name="address" value={resume.address || resume.location} onChange={onChange} />
        <Field label="Phone" name="phone" value={resume.phone} onChange={onChange} />
        <Field label="Email" type="email" name="email" value={resume.email} onChange={onChange} />
        <Field className="col-span-2" label="LinkedIn Profile Link" name="linkedin" value={resume.linkedin} onChange={onChange} />
        <Field className="col-span-2" label="Personal Website Link (Optional)" name="website" value={resume.website} onChange={onChange} />
      </div>
    </section>
  )
}

function Field({ className = '', label, required, name, value, onChange, type = 'text' }) {
  return <label className={`grid gap-1.5 text-sm text-slate-700 ${className}`}>{label}<input required={required} type={type} name={name} value={value || ''} onChange={onChange} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200" /></label>
}

export default PersonalDetail
