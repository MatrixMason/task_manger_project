<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '@/entities/task/model/types'
import TaskCard from '@/entities/task/components/TaskCard.vue'
import UserFilter from '@/entities/task/components/UserFilter.vue'

defineOptions({
  name: 'TaskList',
})

const props = defineProps<{
  tasks: Task[]
}>()

const selectedUserId = ref<number | null>(null)

const filteredTasks = computed(() => {
  if (!selectedUserId.value) return props.tasks
  return props.tasks.filter((task) => task.assignedTo === selectedUserId.value)
})

const sortedTasks = computed(() =>
  [...filteredTasks.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)
</script>

<template>
  <div class="task-list">
    <div class="task-list__header">
      <UserFilter @filter="userId => selectedUserId = userId ?? null" />
    </div>
    <TaskCard v-for="task in sortedTasks" :key="task.id" :task="task" />
  </div>
</template>

<style lang="scss" scoped>
@import '@/app/styles/variables';

.task-list {
  &__header {
    margin-bottom: $spacing-md;
  }

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-md;
}
</style>
