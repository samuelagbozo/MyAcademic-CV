import { GraduationCap } from 'lucide-react'
import EntryForm from './EntryForm.jsx'

function EducationForm(props) {
  return <EntryForm title="Education" description="Add your educational details" addLabel="Add More Education" emptyIcon={GraduationCap} emptyTitle="No education added yet." emptyHint="Click Add Education to get started." fields={ [['universityName', 'University Name', ''], ['degree', 'Degree', ''], ['major', 'Major', ''], ['startDate', 'Start Date', ''], ['endDate', 'End Date', ''], ['description', 'Description', 'Add details']] } {...props} />
}

export default EducationForm
