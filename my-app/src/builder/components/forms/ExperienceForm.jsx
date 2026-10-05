import { Briefcase } from 'lucide-react'
import EntryForm from './EntryForm.jsx'

function ExperienceForm(props) {
  return <EntryForm title="Professional Experience" description="Add your previous job experience" addLabel="Add More Experience" emptyIcon={Briefcase} emptyTitle="No work experience added yet." emptyHint="Click Add Experience to get started." fields={ [['title', 'Position Title', ''], ['companyName', 'Company Name', ''], ['city', 'City', ''], ['state', 'State', ''], ['startDate', 'Start Date', ''], ['endDate', 'End Date', ''], ['workSummery', 'Work Summary', 'Describe your work and achievements']] } {...props} />
}

export default ExperienceForm
