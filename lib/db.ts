// Database abstraction layer
// Currently using localStorage, but can be swapped for real database later

export async function getProjects() {
  if (typeof window === 'undefined') return []
  
  const data = localStorage.getItem('projects')
  return data ? JSON.parse(data) : []
}

export async function createProject(project: any) {
  if (typeof window === 'undefined') return null
  
  const projects = await getProjects()
  const newProject = {
    ...project,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  
  projects.push(newProject)
  localStorage.setItem('projects', JSON.stringify(projects))
  
  return newProject
}

export async function getSubmittals() {
  if (typeof window === 'undefined') return []
  
  const data = localStorage.getItem('submittals')
  return data ? JSON.parse(data) : []
}

export async function createSubmittal(submittal: any) {
  if (typeof window === 'undefined') return null
  
  const submittals = await getSubmittals()
  const newSubmittal = {
    ...submittal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  
  submittals.push(newSubmittal)
  localStorage.setItem('submittals', JSON.stringify(submittals))
  
  return newSubmittal
}

// For future database integration
export const useLocalStorage = true