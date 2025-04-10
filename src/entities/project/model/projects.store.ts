import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from './types'
import { projectsApi } from '@/shared/api/projects'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProjects() {
    loading.value = true
    error.value = null
    console.log('Store: Fetching projects...')

    try {
      const data = await projectsApi.getProjects()
      console.log('Store: Projects received:', data)
      projects.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch projects'
      console.error('Store: Error fetching projects:', e)
    } finally {
      loading.value = false
    }
  }

  async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    console.log('Store: Creating project:', project)

    try {
      const newProject = await projectsApi.createProject(project)
      console.log('Store: Project created:', newProject)
      projects.value = [...projects.value, newProject]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create project'
      console.error('Store: Error creating project:', e)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id: number, updates: Partial<Project>) {
    loading.value = true
    error.value = null
    console.log('Store: Updating project:', id, updates)

    try {
      const updatedProject = await projectsApi.updateProject(id, updates)
      console.log('Store: Project updated:', updatedProject)
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update project'
      console.error('Store: Error updating project:', e)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
  }
})
