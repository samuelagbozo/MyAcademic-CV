import { UsersRound } from 'lucide-react'
import EntryForm from './EntryForm.jsx'

function LeadershipExperienceForm(props) {
  return <EntryForm title="Leadership Experience" description="Highlight leadership roles, responsibilities, and impact" addLabel="Add Leadership Experience" emptyIcon={UsersRound} emptyTitle="No leadership experience added yet." emptyHint="Add a team, club, project, or community leadership role." fields={ [['title', 'Leadership Role', 'e.g. Team Lead, Club President'], ['organization', 'Organization or Group', 'Team, club, school, or community group'], ['startDate', 'Start Date', ''], ['endDate', 'End Date', ''], ['description', 'Responsibilities and Impact', 'Describe your leadership responsibilities and results']] } {...props} />
}

export default LeadershipExperienceForm
