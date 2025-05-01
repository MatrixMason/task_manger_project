<script setup lang="ts">
import type { Task, TaskPriority, TaskStatus } from '@/entities/task/model/types'
import { ref } from 'vue'

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
  assignedTo?: number
  projectId?: number
}

const formData = ref<FormData>({
  title: props.initialData?.title || '',
  description: props.initialData?.description || '',
  status: props.initialData?.status || ('todo' as const),
  priority: props.initialData?.priority || ('medium' as const),
  assignedTo: props.initialData?.assignedTo,
  projectId: props.initialData?.projectId,
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

function handleSubmit() {
  emit('submit', formData.value)
}
</script>

<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="title">Название</label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        required
        placeholder="Введите название задачи"
      />
    </div>

    <div class="form-group">
      <label for="description">Описание</label>
      <textarea
        id="description"
        v-model="formData.description"
        required
        placeholder="Введите описание задачи"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="status">Статус</label>
        <select id="status" v-model="formData.status">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="priority">Приоритет</label>
        <select id="priority" v-model="formData.priority">
          <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn--secondary" @click="$emit('cancel')">Отмена</button>
      <button type="submit" class="btn btn--primary">
        {{ props.initialData ? 'Сохранить' : 'Создать' }}
      </button>
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
    gap: v.$spacing-sm;
    margin-top: v.$spacing-lg;
  }
}
</style>
