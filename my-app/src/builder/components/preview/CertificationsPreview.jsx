function CertificationsPreview({ certifications, pageStart = 0, pageEnd = certifications.length, showHeading = true }) {
  const visibleCertifications = certifications.slice(pageStart, pageEnd)

  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      {showHeading && <h2 className="resume-a4-section-heading mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase text-slate-900">Certifications</h2>}
      <div className="space-y-3">
        {visibleCertifications.map((item, index) => (
          <div className="resume-a4-entry" key={pageStart + index}>
            <p className="flex flex-wrap justify-between gap-x-3">
              <span className="min-w-0 font-semibold">{item.name}</span>
              <span className="min-w-0">{[item.issuer, item.issueDate, item.expiryDate && `Expires ${item.expiryDate}`].filter(Boolean).join(' | ')}</span>
            </p>
            {item.credentialId && <p className="mt-1">Credential ID: {item.credentialId}</p>}
            {item.credentialUrl && <p className="mt-1 break-all">{item.credentialUrl}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

export default CertificationsPreview
