<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '@/entities/project/model/projects.store.ts'
import BaseModal from '@/shared/ui/Modal/BaseModal.vue'

defineOptions({
  name: 'ProjectsPage',
})

const showCreateModal = ref(false)
const formData = ref({
  name: '',
  description: '',
})

const projectsStore = useProjectsStore()
const { projects, loading, error } = projectsStore

// Fetch projects when component is mounted
onMounted(async () => {
  console.log('Fetching projects...')
  try {
    await projectsStore.fetchProjects()
    console.log('Projects loaded:', projects)
  } catch (e) {
    console.error('Failed to fetch projects:', e)
  }
})

async function handleCreateProject() {
  try {
    console.log('Creating project:', formData.value)
    await projectsStore.createProject({
      name: formData.value.name,
      description: formData.value.description,
      status: 'active',
      teamMembers: [],
    })
    console.log('Project created successfully')
    showCreateModal.value = false
    formData.value = {
      name: '',
      description: '',
    }
    // Перезагружаем список проектов после создания
    await projectsStore.fetchProjects()
  } catch (e) {
    console.error('Failed to create project:', e)
  }
}
</script>

<template>
  <div class="projects-page">
    <header class="projects-page__header">
      <h1>Проекты</h1>
      <button class="btn btn--primary" @click="showCreateModal = true">Создать проект</button>
    </header>

    <div v-if="loading" class="projects-page__loading">Загрузка проектов...</div>

    <div v-else-if="error" class="projects-page__error">
      {{ error }}
    </div>

    <div v-else class="projects-list">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <div class="project-card__status">Статус: {{ project.status }}</div>
      </div>
    </div>

    <BaseModal v-model:show="showCreateModal" title="Создать проект">
      <form @submit.prevent="handleCreateProject">
        <div class="form-group">
          <label for="name">Название</label>
          <input id="name" v-model="formData.name" type="text" required />
        </div>
        <div class="form-group">
          <label for="description">Описание</label>
          <textarea id="description" v-model="formData.description" required></textarea>
        </div>
        <div class="form-actions">
          <button type="button" @click="showCreateModal = false">Отмена</button>
          <button type="submit" class="btn--primary">Создать</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.projects-page {
  padding: 2rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  &__loading {
    text-align: center;
    margin: 2rem 0;
  }

  &__error {
    text-align: center;
    margin: 2rem 0;
    color: v.$error-color;
  }
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 0.5rem;
  }

  p {
    color: v.$text-secondary;
    margin-bottom: 1rem;
  }

  &__status {
    font-size: 0.875rem;
    color: v.$text-secondary;
  }
}

.form-group {
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;

  &--primary {
    background: v.$primary-color;
    color: white;

    &:hover {
      filter: brightness(0.95);
    }
  }
}
</style>
