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
      console.log('Updating task:', props.task.id, typeof props.task.id)
      await tasksStore.updateTask(props.task.id, {
        ...props.task,
        ...data,
        updatedAt: new Date().toISOString(),
      })
    } else {
      const allTasks = (await tasksStore.fetchTasks()) || []
      const maxId = Math.max(...allTasks.map((t) => Number(t.id)), 0)
      const nextId = maxId + 1

      const now = new Date().toISOString()
      const taskData = {
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        assignedTo: data.assignedTo || 0,
        projectId: data.projectId || 0,
        createdAt: now,
        updatedAt: now,
      }
      await tasksStore.createTask(taskData, nextId)
    }
    emit('saved')
    emit('update:show', false)
  } catch (error) {
    console.error('Failed to save task:', error)
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
