import { GraduationCap } from 'lucide-react'
import EntryForm from './EntryForm.jsx'

function EducationForm(props) {
  return <EntryForm title="Education" description="Add your educational details" addLabel="Add More Education" emptyIcon={GraduationCap} emptyTitle="No education added yet." emptyHint="Click Add Education to get started." fields={ [['institution', 'Institution', 'School, college, or university'], ['degree', 'Degree or qualification', 'e.g. BSc, Master’s, Senior High School Diploma'], ['major', 'Program or major', 'e.g. Computer Engineering, General Science'], ['startDate', 'Start Date', ''], ['endDate', 'End Date', ''], ['description', 'Description', 'Add details']] } {...props} />
}

export default EducationForm
