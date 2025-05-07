export interface Comment {
  id: string
  taskId: string
  userId: string
  text: string
  createdAt: string
  updatedAt: string
  attachments: Attachment[]
}

export interface CreateCommentData {
  taskId: string
  text: string
  attachments?: File[]
}

export interface UpdateCommentData {
  id: string
  text: string
}

export interface Attachment {
  id: string
  commentId: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  createdAt: string
}
