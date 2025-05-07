import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from './types'
import { projectsApi } from '@/shared/api/projects'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref({
    search: '',
    status: '',
    sortBy: 'updatedAt'
  })

  const filteredProjects = computed(() => {
    return projects.value
      .filter(project => {
        // Фильтр по поиску
        const matchesSearch = project.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          project.description.toLowerCase().includes(filters.value.search.toLowerCase())

        // Фильтр по статусу
        const matchesStatus = !filters.value.status || project.status === filters.value.status

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        // Сортировка
        switch (filters.value.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'updatedAt':
          default:
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }
      })
  })

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

  async function deleteProject(id: number) {
    loading.value = true
    error.value = null
    console.log('Store: Deleting project:', id)

    try {
      await projectsApi.deleteProject(id)
      console.log('Store: Project deleted:', id)
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete project'
      console.error('Store: Error deleting project:', e)
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
    filters,
    filteredProjects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
})
