<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/entities/task/model/types'
import TaskCard from '@/entities/task/components/TaskCard.vue'

defineOptions({
  name: 'TaskList'
})

const props = defineProps<{
  tasks: Task[]
}>()

const sortedTasks = computed(() =>
  [...props.tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)
</script>

<template>
  <div class="task-list">
    <TaskCard v-for="task in sortedTasks" :key="task.id" :task="task" />
  </div>
</template>

<style lang="scss" scoped>
@import '@/app/styles/variables';

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-md;
}
</style>
