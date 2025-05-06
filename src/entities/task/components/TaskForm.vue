<script setup lang="ts">
import type { Task, TaskPriority, TaskStatus } from '@/entities/task/model/types'
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/entities/user/model/users.store'
import { useProjectsStore } from '@/entities/project/model/projects.store'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'
import BaseSelect from '@/shared/ui/Select/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/Textarea/BaseTextarea.vue'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'

defineOptions({
  name: 'TaskForm',
})

const props = defineProps<{
  initialData?: Partial<Task>
}>()

const emit = defineEmits<{
  (e: 'submit', data: Partial<Task>): void
  (e: 'cancel'): void
}>()

type FormData = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: number | null
  projectId: number | undefined
  deadline: string | null
}

const formData = ref<FormData>({
  title: props.initialData?.title || '',
  description: props.initialData?.description || '',
  status: props.initialData?.status || ('todo' as const),
  priority: props.initialData?.priority || ('medium' as const),
  assignedTo: props.initialData?.assignedTo || null,
  projectId: props.initialData?.projectId,
  deadline: props.initialData?.deadline || null,
})

const statusOptions = [
  { value: 'todo', label: 'К выполнению' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'done', label: 'Готово' },
]

const priorityOptions = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
]

const usersStore = useUsersStore()
const projectsStore = useProjectsStore()
const { users } = storeToRefs(usersStore)

onMounted(async () => {
  await Promise.all([
    usersStore.fetchUsers(),
    projectsStore.fetchProjects()
  ])
})

function handleSubmit() {
  emit('submit', formData.value)
}
</script>

<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <BaseInput
        v-model="formData.title"
        label="Название"
        required
        placeholder="Введите название задачи"
      />
    </div>

    <div class="form-group">
      <BaseTextarea
        v-model="formData.description"
        label="Описание"
        required
        placeholder="Введите описание задачи"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <BaseSelect
          v-model="formData.status"
          label="Статус"
          :options="statusOptions"
          option-label="label"
          option-value="value"
        />
      </div>

      <div class="form-group">
        <BaseSelect
          v-model="formData.priority"
          label="Приоритет"
          :options="priorityOptions"
          option-label="label"
          option-value="value"
        />
      </div>
    </div>

    <div class="form-group">
      <BaseSelect
        v-model="formData.projectId"
        label="Проект"
        :options="[{ value: null, label: 'Без проекта' }, ...projectsStore.projects.map(p => ({ value: p.id, label: p.name }))]"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <BaseInput v-model="formData.deadline" type="datetime-local" label="Дедлайн" />
      </div>

      <div class="form-group">
        <BaseSelect
          v-model="formData.assignedTo"
          label="Исполнитель"
          :options="users"
          option-label="name"
          option-value="id"
          placeholder="Выберите исполнителя"
          clearable
        />
      </div>
    </div>

    <div class="form-actions">
      <BaseButton type="button" variant="secondary" size="md" @click="$emit('cancel')">
        Отмена
      </BaseButton>
      <BaseButton type="submit" variant="primary" size="md">
        {{ props.initialData ? 'Сохранить' : 'Создать' }}
      </BaseButton>
    </div>
  </form>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.task-form {
  .form-group {
    margin-bottom: v.$spacing-md;

    label {
      display: block;
      margin-bottom: v.$spacing-xs;
      color: v.$text-primary;
      font-weight: 500;
    }

    input,
    textarea,
    select {
      width: 100%;
      padding: v.$spacing-sm;
      border: 1px solid v.$border-color;
      border-radius: v.$border-radius-sm;
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: v.$primary-color;
      }
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: v.$spacing-md;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: v.$spacing-md;
    margin-top: v.$spacing-lg;

    .material-icons {
      font-size: 1.25rem;
    }
  }
}
</style>
