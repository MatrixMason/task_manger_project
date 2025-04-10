<script setup lang="ts">
import { ref, defineComponent } from 'vue'
import type { Project } from '@/shared/api/types'

defineComponent({
  name: 'ProjectsPage',
})

const projects = ref<Project[]>([
  {
    id: 1,
    name: 'Веб-сайт компании',
    description: 'Редизайн корпоративного сайта',
    status: 'active',
  },
])
</script>

<template>
  <div class="projects-page">
    <header class="projects-page__header">
      <h1>Проекты</h1>
      <button class="btn btn--primary">Создать проект</button>
    </header>

    <div class="projects-list">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <span class="project-status" :class="'project-status--' + project.status">
          {{ project.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.projects-page {
  padding: 2rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
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
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
}

.project-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;

  &--active {
    background: var(--success-color);
    color: white;
  }

  &--completed {
    background: var(--secondary-color);
    color: white;
  }

  &--archived {
    background: var(--text-secondary);
    color: white;
  }
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;

  &--primary {
    background: var(--primary-color);
    color: white;

    &:hover {
      filter: brightness(0.95);
    }
  }
}
</style>
