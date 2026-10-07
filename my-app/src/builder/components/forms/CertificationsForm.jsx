import { BadgeCheck } from 'lucide-react'
import EntryForm from './EntryForm.jsx'

function CertificationsForm(props) {
  return <EntryForm title="Certifications" description="Add professional certificates, licenses, and credentials" addLabel="Add Certification" emptyIcon={BadgeCheck} emptyTitle="No certifications added yet." emptyHint="Add a certification or credential to get started." fields={ [['name', 'Certification', 'Certification or license name'], ['issuer', 'Issuing organization', 'Organization that issued it'], ['issueDate', 'Issue date', ''], ['expiryDate', 'Expiry date', ''], ['credentialId', 'Credential ID', 'Optional credential ID'], ['credentialUrl', 'Credential URL', 'Optional verification link', 'url']] } {...props} />
}

export default CertificationsForm
