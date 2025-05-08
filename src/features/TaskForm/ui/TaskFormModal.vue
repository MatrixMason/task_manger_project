<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePermissions } from '@/features/Auth/lib/usePermissions'
import TaskForm from '@/entities/task/components/TaskForm.vue'
import BaseModal from '@/shared/ui/Modal/BaseModal.vue'
import CommentsList from '@/entities/comment/ui/CommentsList.vue'
import CommentForm from '@/features/CommentForm/ui/CommentForm.vue'
import { useTasksStore } from '@/entities/task/model/tasks.store'
import { useUsersStore } from '@/entities/user/model/users.store'
import type { Task, CreateTaskData, TaskAttachment } from '@/entities/task/model/types'

defineOptions({
  name: 'TaskFormModal',
})

const props = defineProps<{
  show: boolean
  task?: Task
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  save: [task: Task]
}>()

const tasksStore = useTasksStore()
const usersStore = useUsersStore()
const { currentUser } = storeToRefs(usersStore)
const { hasPermission } = usePermissions()

const isCreatingNewTask = computed(() => !props.task)

const isTaskAuthor = computed(() => {
  if (isCreatingNewTask.value) return false
  return props.task?.createdBy === currentUser.value?.id
})

const canEdit = computed(() => {
  if (isCreatingNewTask.value) {
    return hasPermission('tasks.create')
  }

  if (isTaskAuthor.value) {
    return true
  }

  return hasPermission('tasks.edit')
})

const isReadOnly = computed(() => !canEdit.value)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedFiles = ref<File[]>([])

function handleClose() {
  selectedFiles.value = []
  error.value = null
  emit('update:show', false)
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const newFiles = Array.from(input.files)
    const totalSize = [...selectedFiles.value, ...newFiles].reduce(
      (sum, file) => sum + file.size,
      0,
    )

    if (totalSize > 10 * 1024 * 1024) {
      error.value = 'Total file size cannot exceed 10MB'
      return
    }

    selectedFiles.value.push(...newFiles)
  }
}

function removeFile(index: number) {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function handleSubmit(formData: Partial<Task>) {
  loading.value = true
  error.value = null

  try {
    const now = new Date().toISOString()

    const taskData: Partial<Task> = {
      ...formData,
      updatedAt: now,
      createdBy: currentUser.value?.id || '',
    }

    if (selectedFiles.value.length > 0) {
      const newAttachments = await Promise.all(
        selectedFiles.value.map(async (file) => {
          const reader = new FileReader()
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })

          return {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            content: base64,
          } as TaskAttachment
        }),
      )

      taskData.attachments = [...(props.task?.attachments || []), ...newAttachments]
    } else if (props.task?.attachments) {
      taskData.attachments = props.task.attachments
    }

    let savedTask: Task
    if (props.task?.id) {
      await tasksStore.fetchTasks()

      const taskId = props.task.id
      if (!taskId) {
        throw new Error('Task ID is required for update')
      }

      const updateData: Partial<Task> = {
        ...taskData,
        id: taskId
      }

      const updateResult = await tasksStore.updateTask(taskId, updateData)
      if (!updateResult || !updateResult.id) {
        throw new Error('Failed to update task: Invalid response from server')
      }
      savedTask = updateResult
    } else {
      const createData: CreateTaskData = {
        title: taskData.title || '',
        description: taskData.description,
        status: 'todo',
        priority: taskData.priority || 'medium',
        assignedTo: taskData.assignedTo || null,
        projectId: taskData.projectId,
        deadline: taskData.deadline || null,
        attachments: selectedFiles.value,
        createdBy: taskData.createdBy || '',
      }

      const createResult = await tasksStore.createTask(createData)
      if (!createResult) {
        throw new Error('Failed to create task: No response from server')
      }
      savedTask = createResult
    }

    await tasksStore.fetchTasks()
    emit('save', savedTask)
    handleClose()
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Failed to save task'
    console.error('Failed to save task:', e)
    error.value = errorMessage
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal
    :show="show"
    :title="props.task ? 'Редактирование задачи' : 'Создание задачи'"
    @update:show="handleClose"
    class="task-modal"
  >
    <template #default>
      <div class="task-modal__content">
        <TaskForm
          :task="props.task"
          :readonly="isReadOnly"
          @submit="handleSubmit"
          @cancel="handleClose"
        />

        <div v-if="error" class="task-modal__error">
          <span class="task-modal__error-icon">⚠️</span>
          {{ error }}
        </div>

        <div class="form-group">
          <label>Attachments</label>
          <div class="attachments-area">
            <div v-if="selectedFiles.length" class="selected-files">
              <div v-for="(file, index) in selectedFiles" :key="index" class="selected-file">
                <span class="selected-file__icon">📎</span>
                <span class="selected-file__name" :title="file.name">{{ file.name }}</span>
                <span class="selected-file__size">{{ formatFileSize(file.size) }}</span>
                <button
                  type="button"
                  class="selected-file__remove"
                  @click="removeFile(index)"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            </div>

            <label class="file-input">
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                @change="handleFileSelect"
              />
              <span class="file-input__icon">📎</span>
              <span class="file-input__text">Прикрепить файлы</span>
            </label>
          </div>
        </div>

        <div v-if="props.task" class="comments-section">
          <h3 class="comments-section__title">Комментарии</h3>
          <CommentForm :task-id="String(props.task.id)" />
          <CommentsList :task-id="String(props.task.id)" />
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.task-modal :deep(.modal-container) {
  max-width: 600px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.task-modal__content {
  padding: 24px;
}

.task-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.task-modal__error {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  color: #d32f2f;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.task-modal__error-icon {
  margin-right: 8px;
}

.form-group {
  margin-top: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-secondary);
}

.attachments-area {
  margin-top: 12px;
}

.selected-files {
  margin-bottom: 12px;
}

.selected-file {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-bottom: 8px;
}

.selected-file__icon {
  margin-right: 8px;
  color: #6c757d;
}

.selected-file__name {
  flex: 1;
  margin-right: 8px;
  font-size: 0.875rem;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-file__size {
  margin-right: 12px;
  font-size: 0.75rem;
  color: #6c757d;
}

.selected-file__remove {
  padding: 4px;
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.selected-file__remove:hover {
  opacity: 1;
}

.file-input {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--bg-secondary);
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-input:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--color-primary);
}

.file-input input[type='file'] {
  display: none;
}

.file-input__icon {
  margin-right: 8px;
}

.file-input__text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.comments-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.comments-section__title {
  margin: 0 0 16px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
}

.task-modal :deep(.form-field) {
  margin-bottom: 20px;
}

.task-modal :deep(.form-field__label) {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-secondary);
}

.task-modal :deep(.form-field__input),
.task-modal :deep(.form-field__select),
.task-modal :deep(.form-field__textarea) {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 6px;
  font-size: 0.875rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.task-modal :deep(.form-field__input:focus),
.task-modal :deep(.form-field__select:focus),
.task-modal :deep(.form-field__textarea:focus) {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-hover);
  background-color: var(--color-background);
}

.task-modal :deep(.form-field__textarea) {
  min-height: 100px;
  resize: vertical;
}

/* Button styling */
.task-modal :deep(.form-actions) {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.task-modal :deep(.form-actions button) {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.task-modal :deep(.form-actions button[type='submit']) {
  background-color: #007bff;
  color: white;
}

.task-modal :deep(.form-actions button[type='submit']:hover) {
  background-color: #0056b3;
}

.task-modal :deep(.form-actions button[type='button']) {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.task-modal :deep(.form-actions button[type='button']:hover) {
  background-color: var(--bg-tertiary);
}

.task-modal :deep(.form-actions button:disabled) {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Comments section styling */
.comments-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--color-border);

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--color-text);
  }
}
</style>
