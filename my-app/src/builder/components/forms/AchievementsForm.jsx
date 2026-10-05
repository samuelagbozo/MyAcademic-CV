import { Trophy } from 'lucide-react'
import EntryForm from './EntryForm.jsx'

function AchievementsForm(props) {
  return <EntryForm title="Achievements" description="Highlight awards, accomplishments, and recognition" addLabel="Add Achievement" emptyIcon={Trophy} emptyTitle="No achievements added yet." emptyHint="Add an award or accomplishment to get started." fields={ [['title', 'Achievement', 'Achievement or award'], ['organization', 'Awarded by', 'School, organization, or event'], ['date', 'Date', ''], ['description', 'Details', 'Describe what you accomplished']] } {...props} />
}

export default AchievementsForm
