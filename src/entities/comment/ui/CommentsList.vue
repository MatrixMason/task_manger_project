<template>
  <div class="comments-list">
    <h3 class="comments-list__title">Комментарии</h3>
    <div v-if="loading" class="comments-list__loading">
      <span class="loader"></span> Загрузка...
    </div>
    <div v-else-if="error" class="comments-list__error">
      <span class="error-icon">⚠️</span> {{ error }}
    </div>
    <div v-else-if="!comments.length" class="comments-list__empty">
      <span class="empty-icon">💭</span> Нет комментариев
    </div>
    <div v-else class="comments-list__items">
      <div v-for="comment in comments" :key="comment.id" class="comment">
        <div class="comment__header">
          <div class="comment__author">
            {{ getUserName(comment.userId) }}
          </div>
          <div class="comment__date">
            {{ formatDate(comment.createdAt) }}
          </div>
        </div>
        <div v-if="editingCommentId === comment.id" class="comment__edit">
          <textarea v-model="editContent" class="comment__edit-input" />
          <div class="comment__edit-actions">
            <button @click="saveEdit(comment)" class="comment__edit-save">
              Save
            </button>
            <button @click="cancelEditing()" class="comment__edit-cancel">
              Cancel
            </button>
          </div>
        </div>
        <div v-else class="comment__content">
          {{ comment.text }}
        </div>
        <div v-if="comment.attachments?.length" class="comment__attachments">
          <div v-for="attachment in comment.attachments" :key="attachment.id" class="comment__attachment">
            <a :href="attachment.url" target="_blank" class="comment__attachment-link">
              {{ attachment.fileName }}
            </a>
          </div>
        </div>
        <div class="comment__actions">
          <button @click="startEditing(comment)" class="comment__action">
            Edit
          </button>
          <button @click="deleteComment(comment.id)" class="comment__action comment__action--delete">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommentsStore } from '@/entities/comment/model/comments.store'
import { useUsersStore } from '@/entities/user/model/users.store'
import type { Comment } from '../model/types'

const props = defineProps<{
  taskId: string
}>()

const commentsStore = useCommentsStore()
const usersStore = useUsersStore()
const { comments, loading, error } = storeToRefs(commentsStore)
const { users } = storeToRefs(usersStore)

function getUserName(userId: string) {
  const user = users.value.find(u => u.id === userId)
  return user?.name || 'Неизвестный пользователь'
}

const editingCommentId = ref<string | null>(null)
const editContent = ref('')

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

async function startEditing(comment: Comment) {
  editingCommentId.value = comment.id
  editContent.value = comment.text
}

async function cancelEditing() {
  editingCommentId.value = null
  editContent.value = ''
}

async function saveEdit(comment: Comment) {
  try {
    await commentsStore.updateComment({
      id: comment.id,
      text: editContent.value
    })
    editingCommentId.value = null
    editContent.value = ''
  } catch (e) {
    console.error(e)
  }
}

async function deleteComment(commentId: string) {
  try {
    await commentsStore.deleteComment(commentId)
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  await Promise.all([
    commentsStore.fetchTaskComments(props.taskId),
    usersStore.fetchUsers()
  ])
})
</script>

<style scoped>
.comments-list {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
}

.comments-list__title {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.comments-list__loading,
.comments-list__error,
.comments-list__empty {
  padding: 1rem;
  text-align: center;
  color: var(--color-text);
  background: var(--color-background);
  border-radius: 6px;
  margin-bottom: 1rem;
}

.loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  margin-right: 0.5rem;
  font-size: 1.1em;
}

.comment {
  padding: 1rem;
  margin-bottom: 1rem;
}

.comment__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.comment__content {
  margin-bottom: 1rem;
  white-space: pre-wrap;
  color: var(--text-primary);
}

.comment__edit-input {
  width: 100%;
  min-height: 100px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  resize: vertical;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;

  &:hover,
  &:focus {
    background-color: var(--color-primary);
    color: var(--text-on-primary);
    border-color: var(--color-primary);
  }
}

.comment__edit-actions {
  display: flex;
  gap: 0.5rem;
}

.comment__edit-save,
.comment__edit-cancel {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-primary);
  background: var(--bg-primary);
}

.comment__edit-save {
  background: var(--color-primary);
  color: white;
}

.comment__attachments {
  margin-bottom: 1rem;
}

.comment__attachment {
  margin-bottom: 0.5rem;
}

.comment__attachment-link {
  color: var(--color-primary);
  text-decoration: none;
  
  &:hover {
    color: var(--color-primary-hover);
  }
}

.comment__attachment-link:hover {
  text-decoration: underline;
}

.comment__actions {
  display: flex;
  gap: 0.5rem;
}

.comment__action {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
  }
}

.comment__action--delete {
  color: var(--color-error);
  border-color: var(--color-error);
  
  &:hover {
    background: var(--color-error);
    color: var(--text-on-primary);
  }
}
</style>
