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
  task?: Partial<Task>
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: Partial<Task>): void
  (e: 'cancel'): void
}>()

type FormData = {
  id?: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string | null
  projectId: string
  deadline: string | null
}

const formData = ref<FormData>({
  id: props.task?.id,
  title: props.task?.title || '',
  description: props.task?.description || '',
  status: props.task?.status || 'todo',
  priority: props.task?.priority || 'medium',
  assignedTo: props.task?.assignedTo || null,
  projectId: props.task?.projectId || '0',
  deadline: props.task?.deadline || null,
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
  await Promise.all([usersStore.fetchUsers(), projectsStore.fetchProjects()])
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
        :readonly="props.readonly"
        placeholder="Введите название задачи"
      />
    </div>

    <div class="form-group">
      <BaseTextarea
        v-model="formData.description"
        label="Описание"
        required
        :readonly="props.readonly"
        placeholder="Введите описание задачи"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <BaseSelect
          v-model="formData.status"
          label="Статус"
          :options="statusOptions"
          :disabled="props.readonly"
          option-label="label"
          option-value="value"
        />
      </div>

      <div class="form-group">
        <BaseSelect
          v-model="formData.priority"
          label="Приоритет"
          :options="priorityOptions"
          :disabled="props.readonly"
          option-label="label"
          option-value="value"
        />
      </div>
    </div>

    <div class="form-group">
      <BaseSelect
        v-model="formData.projectId"
        label="Проект"
        :disabled="props.readonly"
        :options="[
          { value: 0, label: 'Без проекта' },
          ...projectsStore.projects.map((p) => ({ value: p.id, label: p.name })),
        ]"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <BaseInput
          v-model="formData.deadline"
          type="datetime-local"
          label="Дедлайн"
          :readonly="props.readonly"
        />
      </div>

      <div class="form-group">
        <BaseSelect
          v-model="formData.assignedTo"
          label="Исполнитель"
          :options="users"
          :disabled="props.readonly"
          option-label="name"
          option-value="id"
          placeholder="Выберите исполнителя"
          clearable
        />
      </div>
    </div>

    <div class="form-actions">
      <BaseButton type="button" variant="secondary" size="md" @click="$emit('cancel')">
        {{ props.readonly ? 'Закрыть' : 'Отмена' }}
      </BaseButton>
      <BaseButton v-if="!props.readonly" type="submit" variant="primary" size="md">
        {{ props.task ? 'Сохранить' : 'Создать' }}
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
  }
}
</style>
