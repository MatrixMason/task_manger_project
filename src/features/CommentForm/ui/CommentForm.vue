<template>
  <form @submit.prevent="handleSubmit" class="comment-form">
    <div class="form-field">
      <textarea
        v-model="text"
        placeholder="Write a comment..."
        :disabled="loading"
        required
      />
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <button type="submit" :disabled="loading || !text.trim()">
      {{ loading ? 'Sending...' : 'Send' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCommentsStore } from '@/entities/comment/model/comments.store'

const props = defineProps<{
  taskId: string
}>()

const commentsStore = useCommentsStore()
const text = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (!text.value.trim()) return

  loading.value = true
  error.value = null

  try {
    await commentsStore.addComment({
      taskId: props.taskId,
      text: text.value.trim(),
      attachments: []
    })

    text.value = ''
  } catch (e) {
    console.error('Failed to add comment:', e)
    error.value = 'Failed to add comment'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.comment-form {
  margin-bottom: 24px;
}

.form-field {
  margin-bottom: 16px;
}

textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  resize: vertical;
  font-family: inherit;
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;

  &:hover,
  &:focus {
    background-color: var(--color-primary);
    color: var(--text-on-primary);
    border-color: var(--color-primary);
    outline: none;
  }
}

textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.25rem var(--color-primary-hover);
}

.error-message {
  margin-bottom: 16px;
  padding: 12px;
  background-color: var(--color-error);
  border: 1px solid var(--color-error-hover);
  border-radius: 4px;
  color: var(--text-on-primary);
  font-size: 0.875rem;
}

button[type="submit"] {
  padding: 8px 16px;
  background-color: var(--color-primary);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

button[type="submit"]:disabled {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.comment-form__error {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-form__error::before {
  content: '⚠️';
  font-size: 1.1em;
}
</style>
