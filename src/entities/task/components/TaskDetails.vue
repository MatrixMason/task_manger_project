<template>
  <div v-if="task" class="task-details">
    <div class="task-details__header">
      <h2>{{ task.title }}</h2>
      <div class="task-details__status">
        Статус: {{ task.status }}
      </div>
    </div>

    <div class="task-details__description">
      {{ task.description }}
    </div>

    <div class="task-details__dates">
      <div>Создано: {{ formatDate(task.createdAt) }}</div>
      <div v-if="task.dueDate">Срок: {{ formatDate(task.dueDate) }}</div>
    </div>

    <div class="task-details__comments">
      <h3>Комментарии</h3>
      <CommentForm :task-id="task.id" />
      <CommentsList :task-id="task.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCommentsStore } from '@/entities/comment/model/comments.store'
import CommentsList from '@/entities/comment/ui/CommentsList.vue'
import CommentForm from '@/features/CommentForm/ui/CommentForm.vue'

const props = defineProps<{
  task: {
    id: string
    title: string
    description: string
    status: string
    createdAt: string
    dueDate?: string
  }
}>()

const commentsStore = useCommentsStore()

onMounted(async () => {
  if (props.task) {
    await commentsStore.fetchTaskComments(props.task.id)
  }
})

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.task-details {
  padding: 1rem;
}

.task-details__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.task-details__status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--color-background-light);
}

.task-details__description {
  margin-bottom: 1rem;
  white-space: pre-wrap;
}

.task-details__dates {
  margin-bottom: 1rem;
  color: var(--color-text-light);
}

.task-details__comments {
  margin-top: 2rem;
}

.task-details__comments h3 {
  margin-bottom: 1rem;
}
</style>
