<script setup lang="ts">
import { ref, watch, defineOptions } from 'vue'
import { useTasksStore } from '@/entities/task/model/tasks.store'
import type { TaskPriority } from '@/entities/task/model/types'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'

defineOptions({
  name: 'TaskFilters'
})

const tasksStore = useTasksStore()

const search = ref('')
const selectedPriority = ref<TaskPriority | ''>('')

watch([search, selectedPriority], () => {
  tasksStore.setFilters({
    search: search.value,
    priority: selectedPriority.value || undefined,
  })
})
</script>

<template>
  <div class="task-filters">
    <div class="task-filters__search">
      <input
        v-model="search"
        type="text"
        placeholder="Поиск задач..."
        class="task-filters__input"
      />
    </div>

    <div class="task-filters__priority">
      <select v-model="selectedPriority" class="task-filters__select">
        <option value="">Все приоритеты</option>
        <option value="low">Низкий</option>
        <option value="medium">Средний</option>
        <option value="high">Высокий</option>
      </select>
    </div>

    <BaseButton variant="secondary" @click="tasksStore.setFilters({})"> Сбросить фильтры </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
@import '@/app/styles/variables';

.task-filters {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;

  &__search {
    flex: 1;
  }

  &__input,
  &__select {
    width: 100%;
    padding: $spacing-sm;
    border: 1px solid #ddd;
    border-radius: $border-radius-sm;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}
</style>
