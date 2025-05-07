import { apiInstance } from '@/shared/api/base'
import type { Comment, CreateCommentData, UpdateCommentData } from '@/entities/comment/model/types'
import { useUsersStore } from '@/entities/user/model/users.store'

export const commentsApi = {
  async getTaskComments(taskId: string): Promise<Comment[]> {
    const response = await apiInstance.get(`/comments?taskId=${taskId}`)
    return response.data
  },

  async createComment(data: CreateCommentData): Promise<Comment> {
    const usersStore = useUsersStore()
    if (!usersStore.currentUser) {
      throw new Error('Not authenticated')
    }

    const now = new Date().toISOString()
    const attachmentPromises = data.attachments?.map(async file => {
      // Convert file to base64
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }) || []

    const attachments = await Promise.all(attachmentPromises)

    const commentData = {
      taskId: data.taskId,
      text: data.text,
      userId: usersStore.currentUser.id,
      createdAt: now,
      updatedAt: now,
      attachments: attachments.map((base64, index) => ({
        id: crypto.randomUUID(),
        name: data.attachments![index].name,
        type: data.attachments![index].type,
        size: data.attachments![index].size,
        content: base64
      }))
    }

    const response = await apiInstance.post('/comments', commentData)
    return response.data
  },

  async updateComment(data: UpdateCommentData): Promise<Comment> {
    const response = await apiInstance.put(`/comments/${data.id}`, { text: data.text })
    return response.data
  },

  async deleteComment(commentId: string): Promise<void> {
    await apiInstance.delete(`/comments/${commentId}`)
  },

  async deleteAttachment(commentId: string, attachmentId: string): Promise<void> {
    await apiInstance.delete(`/comments/${commentId}/attachments/${attachmentId}`)
  }
}
