import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment, CreateCommentData, UpdateCommentData } from './types'
import { commentsApi } from '@/shared/api/comments'
import { useUsersStore } from '@/entities/user/model/users.store'

export const useCommentsStore = defineStore('comments', () => {
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTaskComments(taskId: string) {
    loading.value = true
    error.value = null
    try {
      comments.value = await commentsApi.getTaskComments(taskId)
    } catch (e) {
      error.value = 'Failed to load comments'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function addComment(data: CreateCommentData) {
    const usersStore = useUsersStore()
    if (!usersStore.currentUser) {
      await usersStore.getCurrentUser()
    }

    if (!usersStore.currentUser) {
      throw new Error('Not authenticated')
    }

    loading.value = true
    error.value = null
    try {
      const newComment = await commentsApi.createComment(data)
      comments.value = [...comments.value, newComment]
    } catch (e) {
      error.value = 'Failed to add comment'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateComment(data: UpdateCommentData) {
    loading.value = true
    error.value = null
    try {
      const updatedComment = await commentsApi.updateComment(data)
      const index = comments.value.findIndex((c) => String(c.id) === String(data.id))
      if (index !== -1) {
        comments.value[index] = updatedComment
      }
    } catch (e) {
      error.value = 'Failed to update comment'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteComment(commentId: string) {
    loading.value = true
    error.value = null
    try {
      await commentsApi.deleteComment(commentId)
      comments.value = comments.value.filter((c) => String(c.id) !== String(commentId))
    } catch (e) {
      error.value = 'Failed to delete comment'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteAttachment(commentId: string, attachmentId: string) {
    loading.value = true
    error.value = null
    try {
      await commentsApi.deleteAttachment(commentId, attachmentId)
      const comment = comments.value.find((c) => String(c.id) === String(commentId))
      if (comment) {
        comment.attachments = (comment.attachments || []).filter((a) => a.id !== attachmentId)
      }
    } catch (e) {
      error.value = 'Failed to delete attachment'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    comments,
    loading,
    error,
    fetchTaskComments,
    addComment,
    updateComment,
    deleteComment,
    deleteAttachment
  }
})
