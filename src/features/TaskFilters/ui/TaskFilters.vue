<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'
import BaseSelect from '@/shared/ui/Select/BaseSelect.vue'
import { useProjectsStore } from '@/entities/project/model/projects.store'
import type { Project } from '@/entities/project/model/types'
import type { TaskStatus, TaskPriority } from '@/entities/task/model/types'

interface Props {
  initialFilters?: {
    search?: string
    status?: TaskStatus
    priority?: TaskPriority
    projectId?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  initialFilters: () => ({
    search: '',
    status: undefined,
    priority: undefined,
    projectId: undefined
  })
})

const emit = defineEmits<{
  (e: 'filter', filters: NonNullable<Props['initialFilters']>): void
}>()

const projectsStore = useProjectsStore()

const filters = ref({
  search: props.initialFilters.search || '',
  status: props.initialFilters.status || '',
  priority: props.initialFilters.priority || '',
  projectId: props.initialFilters.projectId?.toString() || ''
})

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'todo', label: 'К выполнению' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'done', label: 'Завершено' }
]

const priorityOptions = [
  { value: '', label: 'Все приоритеты' },
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' }
]

const projectOptions = computed(() => [
  { value: '', label: 'Все проекты' },
  ...projectsStore.projects.map((project: Project) => ({
    value: project.id.toString(),
    label: project.name
  }))
])

watch(filters, (newFilters) => {
  emit('filter', {
    search: newFilters.search,
    status: newFilters.status ? (newFilters.status as TaskStatus) : undefined,
    priority: newFilters.priority ? (newFilters.priority as TaskPriority) : undefined,
    projectId: newFilters.projectId ? Number(newFilters.projectId) : undefined
  })
}, { deep: true })

onMounted(async () => {
  if (projectsStore.projects.length === 0) {
    await projectsStore.fetchProjects()
  }
})
</script>

<template>
  <div class="task-filters">
    <BaseInput
      v-model="filters.search"
      placeholder="Поиск задач..."
      class="task-filters__search"
    >
      <template #prefix>
        <span class="material-icons">search</span>
      </template>
    </BaseInput>

    <BaseSelect
      v-model="filters.status"
      :options="statusOptions"
      class="task-filters__select"
    />

    <BaseSelect
      v-model="filters.priority"
      :options="priorityOptions"
      class="task-filters__select"
    />

    <BaseSelect
      v-model="filters.projectId"
      :options="projectOptions"
      class="task-filters__select"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.task-filters {
  display: flex;
  gap: v.$spacing-md;
  align-items: center;
  width: 100%;

  &__search {
    width: 250px;
  }

  &__select {
    width: 180px;
  }
}
</style>
