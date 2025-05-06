<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'
import BaseSelect from '@/shared/ui/Select/BaseSelect.vue'

interface Filters {
  search: string
  status: string
  sortBy: string
}

const props = defineProps<{
  initialFilters?: Partial<Filters>
}>()

const emit = defineEmits<{
  (e: 'filter', filters: Filters): void
}>()

const filters = ref<Filters>({
  search: props.initialFilters?.search || '',
  status: props.initialFilters?.status || 'all',
  sortBy: props.initialFilters?.sortBy || 'updatedAt'
})

const statusOptions = [
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Завершенные' },
  { value: 'archived', label: 'В архиве' }
]

const sortOptions = [
  { value: 'updatedAt', label: 'По дате обновления' },
  { value: 'createdAt', label: 'По дате создания' },
  { value: 'name', label: 'По названию' }
]

watch(filters, (newFilters) => {
  emit('filter', newFilters)
}, { deep: true })
</script>

<template>
  <div class="project-filters">
    <div class="filter-group">
      <BaseInput
        v-model="filters.search"
        placeholder="Поиск проектов..."
        type="search"
      />
    </div>
    <div class="filter-group">
      <BaseSelect
        v-model="filters.status"
        :options="statusOptions"
        option-label="label"
        option-value="value"
      />
    </div>
    <div class="filter-group">
      <BaseSelect
        v-model="filters.sortBy"
        :options="sortOptions"
        option-label="label"
        option-value="value"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/app/styles/variables' as v;

.project-filters {
  display: flex;
  gap: v.$spacing-md;
  margin-bottom: v.$spacing-lg;
}

.filter-group {
  min-width: 200px;
}
</style>
