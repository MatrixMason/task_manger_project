<script setup lang="ts">
import type { Project } from '../model/types'
import BaseCard from '@/shared/ui/Card/BaseCard.vue'
import { formatDate } from '@/shared/lib/dates/format'
import { computed } from 'vue'

defineOptions({
  name: 'ProjectCard',
})

const props = defineProps<{
  project: Project
}>()

const statusColor = computed(() => {
  switch (props.project.status) {
    case 'active':
      return 'var(--primary-color)'
    case 'completed':
      return 'var(--success-color)'
    case 'archived':
      return 'var(--text-secondary)'
    default:
      return 'var(--text-primary)'
  }
})
</script>

<template>
  <BaseCard class="project-card">
    <div class="project-card__header">
      <h3 class="project-card__title">{{ project.name }}</h3>
      <span class="project-card__status" :style="{ backgroundColor: statusColor }">
        {{ project.status }}
      </span>
    </div>

    <p class="project-card__description">{{ project.description }}</p>

    <div class="project-card__footer">
      <span class="project-card__team"> {{ project.teamMembers.length }} members </span>
      <span class="project-card__date"> Updated {{ formatDate(project.updatedAt) }} </span>
    </div>
  </BaseCard>
</template>

<style lang="scss" scoped>
@import '@/app/styles/variables';

.project-card {
  height: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-sm;
  }

  &__title {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  &__status {
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    color: white;
    font-size: 0.875rem;
    text-transform: capitalize;
  }

  &__description {
    color: var(--text-secondary);
    margin-bottom: $spacing-md;
    line-height: 1.5;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
}
</style>
