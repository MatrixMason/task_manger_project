<script setup lang="ts">
import { useTasksStore } from '@/entities/task/model/tasks.store'
import type { Task } from '@/entities/task/model/types'
import TaskForm from '@/entities/task/components/TaskForm.vue'
import BaseModal from '@/shared/ui/Modal/BaseModal.vue'
import { computed } from 'vue'

defineOptions({
  name: 'TaskFormModal',
})

const props = defineProps<{
  show: boolean
  task?: Task
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'saved'): void
}>()

const tasksStore = useTasksStore()

const isVisible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

async function handleSubmit(data: Partial<Task>) {
  try {
    if (props.task) {
      await tasksStore.updateTask(props.task.id, data)
    } else {
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        assignedTo: data.assignedTo || 0, // Default to 0 if not assigned
        projectId: data.projectId || 0, // Default to 0 if no project
      }
      await tasksStore.createTask(taskData)
    }
    emit('saved')
    emit('update:show', false)
  } catch (e) {
    console.error('Failed to save task:', e)
  }
}

function handleClose() {
  emit('update:show', false)
}
</script>

<template>
  <BaseModal v-model:show="isVisible" :title="task ? 'Редактировать задачу' : 'Создать задачу'">
    <TaskForm :initial-data="task" @submit="handleSubmit" @cancel="handleClose" />
  </BaseModal>
</template>
