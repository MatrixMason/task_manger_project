<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Task } from '../model/types'
import BaseCard from '@/shared/ui/Card/BaseCard.vue'
import { formatDate } from '@/shared/lib/dates/format'
import { useTasksStore } from '@/entities/task/model/tasks.store'
import { useUsersStore } from '@/entities/user/model/users.store'
import { usePermissions } from '@/features/Auth/lib/usePermissions'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'TaskCard',
})

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: 'click', task: Task): void
  (e: 'delete', taskId: number): void
}>()

const usersStore = useUsersStore()
const { hasPermission } = usePermissions()
const { users } = storeToRefs(usersStore)

const assignee = computed(() => {
  if (!props.task.assignedTo) return null
  return users.value.find((user) => String(user.id) === String(props.task.assignedTo))
})

const isOverdue = computed(() => {
  if (!props.task.deadline) return false
  return new Date(props.task.deadline) < new Date()
})

onMounted(async () => {
  if (users.value.length === 0) {
    await usersStore.fetchUsers()
  }
})

const tasksStore = useTasksStore()

async function handleDelete(e: Event) {
  e.stopPropagation()
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    try {
      const taskId = Number(props.task.id)
      await tasksStore.deleteTask(taskId)
      emit('delete', taskId)
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('Не удалось удалить задачу')
    }
  }
}
</script>

<template>
  <div
    v-if="hasPermission('tasks.view')"
    class="task-card"
    :data-status="task.status"
    @click="emit('click', task)"
  >
    <BaseCard variant="hover">
      <div class="task-card__header">
        <h3>{{ task.title }}</h3>
        <div class="task-card__meta">
          <span
            v-if="task.deadline"
            class="task-card__deadline"
            :class="{ 'task-card__deadline--overdue': isOverdue }"
          >
            до {{ formatDate(task.deadline) }}
          </span>
        </div>
      </div>
      <span :class="['task-card__priority', `task-card__priority--${task.priority}`]">
        {{ task.priority }}
      </span>
      <p class="task-card__description">{{ task.description }}</p>
      <div class="task-card__footer">
        <div class="task-card__user">
          <span v-if="assignee" class="task-card__assignee">
            {{ assignee.name }}
            <span class="task-card__role">- {{ assignee.role }}</span>
          </span>
          <span v-else class="task-card__no-user"> Не назначено </span>
        </div>
        <button
          v-if="hasPermission('tasks.delete')"
          class="task-card__delete"
          @click="handleDelete"
          title="Удалить задачу"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M17 4V6H3V4H6.5L7.5 3H12.5L13.5 4H17M4 19V7H16V19C16 20.1 15.1 21 14 21H6C4.9 21 4 20.1 4 19M19 16H21V18H19V16M19 9H21V14H19V9Z"
            />
          </svg>
        </button>
      </div>
    </BaseCard>
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

$scale-normal: 0.9;
$scale-hover: 1.1;
$scale-active: 0.95;

.task-card {
  cursor: pointer;
  position: relative;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;

    h3 {
      margin: 0;
      font-size: 1rem;
      flex: 1;
    }
  }

  &__date {
    font-size: 0.75rem;
    color: #666;
    white-space: nowrap;
    margin-left: 1rem;
  }

  &__delete {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: matrix(0.9, 0, 0, 0.9, 0, 0);
    position: relative;
    overflow: hidden;

    svg {
      transition: transform 0.2s ease;
      position: relative;
      z-index: 1;
    }

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(211, 47, 47, 0.1);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition:
        width 0.3s ease,
        height 0.3s ease;
    }

    &:hover {
      color: #d32f2f;
      transform: matrix(1.1, 0, 0, 1.1, 0, 0);
      box-shadow: 0 2px 4px rgba(211, 47, 47, 0.2);

      &::before {
        width: 200%;
        height: 200%;
      }

      svg {
        transform: rotate(8deg);
      }
    }

    &:active {
      transform: matrix(0.95, 0, 0, 0.95, 0, 0);
      box-shadow: 0 1px 2px rgba(211, 47, 47, 0.3);
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  &__deadline,
  &__assignee,
  &__date {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    &__role {
      font-size: 0.75rem;
      color: var(--text-secondary);
      background: var(--background-secondary);
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  &__deadline {
    &--overdue {
      color: var(--error-color);
    }
  }

  &:hover &__delete {
    opacity: 1;
  }

  :deep(.card) {
    border: 1px solid $border-color;
    transition: all 0.2s ease;
  }

  &[data-status='todo'] :deep(.card) {
    box-shadow:
      -4px 0 0 $error-color,
      $shadow-sm;
  }

  &[data-status='in-progress'] :deep(.card) {
    box-shadow:
      -4px 0 0 $warning-color,
      $shadow-sm;
  }

  &[data-status='done'] :deep(.card) {
    box-shadow:
      -4px 0 0 $success-color,
      $shadow-sm;
  }

  &:hover {
    :deep(.card) {
      &[data-status='todo'] {
        box-shadow:
          -4px 0 0 $error-color,
          $shadow-md;
      }

      &[data-status='in-progress'] {
        box-shadow:
          -4px 0 0 $warning-color,
          $shadow-md;
      }

      &[data-status='done'] {
        box-shadow:
          -4px 0 0 $success-color,
          $shadow-md;
      }
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-sm;

    h3 {
      margin: 0;
    }
  }

  &__description {
    color: $text-secondary;
    margin-bottom: $spacing-md;
    font-size: 0.9rem;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__priority {
    padding: 2px 6px;
    border-radius: $border-radius-sm;
    font-size: 0.8rem;
    text-transform: capitalize;

    &--high {
      background: $error-color;
      color: white;
    }

    &--medium {
      background: $secondary-color;
      color: white;
    }

    &--low {
      background: $success-color;
      color: white;
    }
  }

  &__status {
    color: $text-secondary;
    text-transform: capitalize;
  }

  &__date {
    font-size: 0.8rem;
    color: $text-secondary;
  }
}
</style>
