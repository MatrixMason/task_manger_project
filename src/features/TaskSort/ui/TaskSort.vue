<script setup lang="ts">
import { ref } from 'vue'
import BaseSelect from '@/shared/ui/Select/BaseSelect.vue'

type SortField = 'createdAt' | 'priority' | 'title'
type SortOrder = 'asc' | 'desc'

interface SortOption {
  field: SortField
  order: SortOrder
}

const emit = defineEmits<{
  (e: 'sort', sort: SortOption): void
}>()

const sortOptions = [
  { value: 'createdAt-desc', label: 'Сначала новые' },
  { value: 'createdAt-asc', label: 'Сначала старые' },
  { value: 'priority-desc', label: 'По приоритету (↓)' },
  { value: 'priority-asc', label: 'По приоритету (↑)' },
  { value: 'title-asc', label: 'По названию (А-Я)' },
  { value: 'title-desc', label: 'По названию (Я-А)' },
]

const selectedSort = ref('')

function handleChange(value: string) {
  const [field, order] = value.split('-') as [SortField, SortOrder]
  emit('sort', { field, order })
}
</script>

<template>
  <div class="task-sort">
    <BaseSelect
      v-model="selectedSort"
      :options="sortOptions"
      class="task-sort__select"
      placeholder="Сортировка..."
      @update:modelValue="handleChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.task-sort {
  &__select {
    width: 200px;
  }
}
</style>
