import { memo } from 'react'
import { formatResumeDateRange } from '../../previewFormatting.js'
function CertificationsPreview({ certifications, pageStart = 0, pageEnd = certifications.length, showHeading = true }) {
  const visibleCertifications = certifications.slice(pageStart, pageEnd)

  return (
    <section className="my-5 text-xs leading-relaxed sm:text-sm">
      {showHeading && <h2 className="resume-a4-section-heading mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase">Certifications</h2>}
      <div className="space-y-3">
        {visibleCertifications.map((item, index) => (
          <div className="resume-a4-entry" key={pageStart + index}>
            <p className="flex items-start justify-between gap-x-3">
              <span className="min-w-0 flex-1 font-semibold">{item.name}</span>
              <span className="shrink-0 text-right">{[item.issuer, item.issueDate && `Issued ${formatResumeDateRange(item.issueDate, '')}`, item.expiryDate && `Expires ${formatResumeDateRange(item.expiryDate, '')}`].filter(Boolean).join(' | ')}</span>
            </p>
            {item.credentialId && <p className="mt-1">Credential ID: {item.credentialId}</p>}
            {item.credentialUrl && <p className="mt-1 break-all">{item.credentialUrl}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(CertificationsPreview)
