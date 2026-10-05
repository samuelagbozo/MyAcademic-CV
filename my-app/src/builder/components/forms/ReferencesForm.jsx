import { ContactRound } from 'lucide-react'
import EntryForm from './EntryForm.jsx'

function ReferencesForm(props) {
  return <EntryForm title="References" description="Add people who can speak to your work" addLabel="Add Reference" emptyIcon={ContactRound} emptyTitle="No references added yet." emptyHint="Add one or more references if you want them on your resume." fields={ [['name', 'Reference Name', 'Full name'], ['organization', 'Company or Institution', 'Company or institution'], ['email', 'Email', 'name@example.com', 'email'], ['telephone', 'Telephone Number', 'Telephone number', 'tel']] } {...props} />
}

export default ReferencesForm
