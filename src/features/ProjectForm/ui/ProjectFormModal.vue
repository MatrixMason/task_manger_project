<script setup lang="ts">
import { usePermissions } from '@/features/Auth/lib/usePermissions'
import { ref, watch, onMounted } from 'vue'
import { useTasksStore } from '@/entities/task/model/tasks.store'
import type { Project, CreateProjectData } from '@/entities/project/model/types'
import BaseModal from '@/shared/ui/Modal/BaseModal.vue'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'
import BaseTextarea from '@/shared/ui/Textarea/BaseTextarea.vue'

interface Props {
  show?: boolean
  project?: Project
  submitLabel?: string
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'submit', data: CreateProjectData): void
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  submitLabel: 'Сохранить'
})

const emit = defineEmits<Emits>()

const { hasPermission } = usePermissions()

const formData = ref<CreateProjectData>({
  name: '',
  description: ''
})

const error = ref('')
const tasksStore = useTasksStore()

onMounted(async () => {
  if (props.project) {
    await tasksStore.fetchTasks()
  }
})

watch(() => props.project, (newProject) => {
  if (newProject) {
    formData.value = {
      name: newProject.name,
      description: newProject.description
    }
  }
}, { immediate: true })

function handleSubmit() {
  if (!formData.value.name.trim()) {
    error.value = 'Название проекта обязательно'
    return
  }

  emit('submit', formData.value)
  handleClose()
}

function getProjectTasks(projectId: string | number) {
  return tasksStore.tasks.filter(task => String(task.projectId) === String(projectId))
}

function handleClose() {
  emit('update:show', false)
  error.value = ''
  if (!props.project) {
    formData.value = {
      name: '',
      description: ''
    }
  }
}
</script>

<template>
  <BaseModal
    v-if="hasPermission(project ? 'projects.edit' : 'projects.create')"
    :show="show"
    :title="project ? 'Редактирование проекта' : 'Новый проект'"
    @update:show="handleClose"
  >
    <form class="project-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <BaseInput
          v-model="formData.name"
          label="Название проекта"
          placeholder="Введите название проекта"
          required
        />
      </div>

      <div class="form-group">
        <BaseTextarea
          v-model="formData.description"
          label="Описание"
          placeholder="Введите описание проекта"
          rows="4"
        />
      </div>

      <div v-if="project" class="project-tasks">
        <h4>Задачи проекта:</h4>
        <div v-if="getProjectTasks(project.id).length" class="tasks-list">
          <div 
            v-for="task in getProjectTasks(project.id)" 
            :key="task.id"
            class="task-item"
          >
            <span class="task-title">{{ task.title }}</span>
            <span :class="['task-status', `status-${task.status}`]">{{ task.status }}</span>
          </div>
        </div>
        <p v-else class="no-tasks">Нет задач</p>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-actions">
        <BaseButton type="button" variant="secondary" size="md" @click="handleClose">
          Отмена
        </BaseButton>
        <BaseButton type="submit" variant="primary" size="md">
          {{ submitLabel }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.project-form {
  display: flex;
  flex-direction: column;
  gap: v.$spacing-md;

  .project-tasks {
    margin-top: v.$spacing-lg;
    padding-top: v.$spacing-lg;
    border-top: 1px solid v.$border-color;

    h4 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      color: var(--text-primary);
    }
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
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    border: 1px solid var(--border-color);

    .dark & {
      background: var(--bg-tertiary);
      border-color: var(--border-color);
    }

  }

  .task-title {
    color: var(--text-primary);
  }

  .task-status {
    padding: v.$spacing-xs v.$spacing-sm;
    border-radius: v.$border-radius-sm;
    font-size: 0.75rem;
    
    &.status-todo {
      background: var(--status-todo-bg);
      color: var(--text-primary);

      .dark & {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }
    }
    
    &.status-in-progress {
      background: var(--status-in-progress-bg);
      color: var(--text-on-primary);

      .dark & {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }
    }
    
    &.status-done {
      background: var(--status-done-bg);
      color: var(--text-on-primary);

      .dark & {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }
    }
  }

  .no-tasks {
    color: v.$text-secondary;
    font-size: 0.875rem;
    font-style: italic;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: v.$spacing-sm;
  margin-bottom: v.$spacing-md;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: v.$spacing-md;
  margin-top: v.$spacing-lg;
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
