<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '@/entities/project/model/projects.store'
import { useTasksStore } from '@/entities/task/model/tasks.store'
import type { Project, CreateProjectData } from '@/entities/project/model/types'
import ProjectFormModal from '@/features/ProjectForm/ui/ProjectFormModal.vue'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'
import BaseModal from '@/shared/ui/Modal/BaseModal.vue'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'
import BaseTextarea from '@/shared/ui/Textarea/BaseTextarea.vue'
import ProjectFilters from '@/features/ProjectFilters/ui/ProjectFilters.vue'
import ConfirmModal from '@/shared/ui/Modal/ConfirmModal.vue'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const showProjectModal = ref(false)
const editingProject = ref<Project | undefined>()
const showCreateModal = ref(false)
const showDeleteConfirm = ref(false)
const projectToDelete = ref<Project | null>(null)
const formData = ref({
  name: '',
  description: '',
})

onMounted(async () => {
  await Promise.all([projectsStore.fetchProjects(), tasksStore.fetchTasks()])
})

async function handleDeleteProject(project: Project) {
  projectToDelete.value = project
  showDeleteConfirm.value = true
}

async function confirmDeleteProject() {
  if (!projectToDelete.value) return
  
  try {
    await projectsStore.deleteProject(projectToDelete.value.id)
    projectToDelete.value = null
  } catch (error) {
    console.error('Failed to delete project:', error)
  }
}

async function handleCreateProject(data: CreateProjectData) {
  try {
    await projectsStore.createProject({
      ...data,
      status: 'active',
      teamMembers: [],
      description: data.description || ''
    })
  } catch (error) {
    console.error('Failed to create project:', error)
  }
}

async function handleEditProject(data: CreateProjectData) {
  if (!editingProject.value) return

  try {
    await projectsStore.updateProject(editingProject.value.id, {
      ...data
    })
    editingProject.value = undefined
  } catch (error) {
    console.error('Failed to update project:', error)
  }
}

function openCreateModal() {
  editingProject.value = undefined
  showProjectModal.value = true
}

function openEditModal(project: Project) {
  editingProject.value = project
  showProjectModal.value = true
}

function getProjectTasks(projectId: string | number) {
  return tasksStore.tasks.filter((task) => String(task.projectId) === String(projectId))
}

function handleProjectSubmit(data: CreateProjectData) {
  if (editingProject.value) {
    handleEditProject(data)
  } else {
    handleCreateProject(data)
  }
}

async function handleCreateProjectForm() {
  try {
    console.log('Creating project:', formData.value)
    await projectsStore.createProject({
      name: formData.value.name,
      description: formData.value.description,
      status: 'active',
      teamMembers: []
    })
    console.log('Project created successfully')
    showCreateModal.value = false
    formData.value = {
      name: '',
      description: '',
    }

    await projectsStore.fetchProjects()
  } catch (e) {
    console.error('Failed to create project:', e)
  }
}
</script>

<template>
  <div class="projects-page">
    <header class="projects-header">
      <div class="header-title">
        <h1>Проекты</h1>
        <button class="btn btn--primary" @click="openCreateModal">Создать проект</button>
      </div>
      <ProjectFilters
        :initial-filters="projectsStore.filters"
        @filter="filters => {
          projectsStore.filters.search = filters.search
          projectsStore.filters.status = filters.status
          projectsStore.filters.sortBy = filters.sortBy
        }"
      />
    </header>

    <div v-if="projectsStore.loading" class="loading">Загрузка проектов...</div>
    <div v-else-if="projectsStore.error" class="error">
      {{ projectsStore.error }}
    </div>
    <div v-else class="projects-list">
      <div v-for="project in projectsStore.filteredProjects" :key="project.id" class="project-card" :class="{ 'project-card--loading': projectsStore.loading }">
        <div class="project-info">
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>

          <!-- задачи проекта -->
          <div class="project-tasks">
            <h4>Задачи проекта:</h4>
            <div v-if="getProjectTasks(project.id).length" class="tasks-list">
              <div v-for="task in getProjectTasks(project.id)" :key="task.id" class="task-item">
                <span class="task-title">{{ task.title }}</span>
                <span :class="['task-status', `status-${task.status}`]">{{ task.status }}</span>
              </div>
            </div>
            <p v-else class="no-tasks">Нет задач</p>
          </div>
        </div>
        <div class="project-actions">
          <BaseButton 
            variant="secondary" 
            size="sm" 
            class="edit-button"
            @click="openEditModal(project)" 
            :disabled="projectsStore.loading"
          >
            <span v-if="projectsStore.loading" class="loading-spinner"></span>
            <span v-else>Редактировать</span>
          </BaseButton>
          <BaseButton 
            variant="danger" 
            size="sm" 
            class="delete-button"
            @click="handleDeleteProject(project)" 
            :disabled="projectsStore.loading"
          >
            <span v-if="projectsStore.loading" class="loading-spinner"></span>
            <span v-else>Удалить</span>
          </BaseButton>
        </div>
      </div>
    </div>

    <ProjectFormModal
      v-model:show="showProjectModal"
      :project="editingProject"
      :submit-label="editingProject ? 'Сохранить изменения' : 'Создать проект'"
      @submit="handleProjectSubmit"
    />

    <BaseModal v-model:show="showCreateModal" title="Создать проект">
      <form @submit.prevent="handleCreateProjectForm">
        <div class="form-group">
          <BaseInput
            id="name"
            v-model="formData.name"
            label="Название"
            required
          />
        </div>
        <div class="form-group">
          <BaseTextarea
            id="description"
            v-model="formData.description"
            label="Описание"
            required
            rows="4"
          />
        </div>
        <div class="form-actions">
          <BaseButton type="button" variant="secondary" size="md" @click="showCreateModal = false">
            Отмена
          </BaseButton>
          <BaseButton type="submit" variant="primary" size="md">
            Создать
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
  <ConfirmModal
    v-model:show="showDeleteConfirm"
    title="Удаление проекта"
    :message="`Вы действительно хотите удалить проект '${projectToDelete?.name}'? Это действие нельзя отменить.`"
    confirm-label="Удалить"
    @confirm="confirmDeleteProject"
  />
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.projects-page {
  padding: v.$spacing-lg;
}

.projects-header {
  margin-bottom: v.$spacing-lg;

  .header-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: v.$spacing-md;

    .btn {
      padding: v.$spacing-sm v.$spacing-md;
      border: none;
      border-radius: v.$border-radius-sm;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;

      &--primary {
        background: v.$primary-color;
        color: white;

        &:hover {
          background: v.$primary-color-hover;
        }
      }
    }

    h1 {
      font-size: 1.5rem;
      color: v.$text-primary;
      margin: 0;
    }
  }
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: v.$spacing-lg;
}

.project-card {
  position: relative;
  
  &--loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    border-radius: v.$border-radius-lg;
    z-index: 1;
  }
  background: v.$background-secondary;
  border-radius: v.$border-radius-lg;
  padding: v.$spacing-lg;
  box-shadow: v.$shadow-sm;

  h3 {
    margin: 0 0 v.$spacing-sm;
    color: v.$text-primary;
  }

  p {
    margin: 0;
    color: v.$text-secondary;
    font-size: 0.875rem;
  }
}

.project-info {
  margin-bottom: v.$spacing-lg;

  h4 {
    margin: v.$spacing-lg 0 v.$spacing-sm;
    font-size: 1rem;
    color: v.$text-primary;
  }
}

.project-tasks {
  margin-top: v.$spacing-lg;
  padding-top: v.$spacing-lg;
  border-top: 1px solid v.$border-color;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: v.$spacing-sm;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: v.$spacing-sm;
  background: v.$background-primary;
  border-radius: v.$border-radius-sm;
  font-size: 0.875rem;
}

.task-title {
  color: v.$text-primary;
}

.task-status {
  padding: v.$spacing-xs v.$spacing-sm;
  border-radius: v.$border-radius-sm;
  font-size: 0.75rem;

  &.status-todo {
    background: v.$status-todo;
    color: v.$text-primary;
  }

  &.status-in-progress {
    background: v.$status-in-progress;
    color: v.$text-primary;
  }

  &.status-done {
    background: v.$status-done;
    color: v.$text-primary;
  }
}

.no-tasks {
  color: v.$text-secondary;
  font-size: 0.875rem;
  font-style: italic;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.project-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  .edit-button {
    padding: 0.35rem 0.75rem;
    font-size: 0.875rem;
    border: 1px solid var(--color-primary);
    border-radius: 4px;
    color: var(--color-primary);
    background: transparent;
    transition: all 0.2s ease;

    &:hover {
      background: var(--color-primary);
      color: white;
    }

    &:active {
      transform: translateY(1px);
    }
  }

  .delete-button {
    padding: 0.35rem 0.75rem;
    font-size: 0.875rem;
    border: 1px solid var(--color-error);
    border-radius: 4px;
    color: var(--color-error);
    background: transparent;
    transition: all 0.2s ease;

    &:hover {
      background: var(--color-error);
      color: white;
    }

    &:active {
      transform: translateY(1px);
    }
  }
}

.loading,
.error {
  text-align: center;
  padding: v.$spacing-xl;
}

.error {
  color: v.$error-color;
}
</style>
