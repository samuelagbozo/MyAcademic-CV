import EntryForm from './EntryForm.jsx'

function ProjectForm(props) {
  return <EntryForm title="Projects" description="Add your projects" addLabel="Add Project" fields={ [['name', 'Project Name', 'Project name'], ['link', 'Project Link', 'https://'], ['details', 'Description', 'Describe the project']] } {...props} />
}

export default ProjectForm
