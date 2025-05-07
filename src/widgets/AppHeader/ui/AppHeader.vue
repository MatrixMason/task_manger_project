<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ThemeToggle from '@/features/ThemeToggle/ui/ThemeToggle.vue'

</script>

<template>
  <header class="app-header">
    <div class="container app-header__container">
      <nav class="app-header__nav">
        <RouterLink to="/" class="app-header__logo">
          Task Manager
        </RouterLink>
        <RouterLink to="/board" class="app-header__link">
          Доска
        </RouterLink>
        <RouterLink to="/projects" class="app-header__link">
          Проекты
        </RouterLink>
      </nav>
      <div class="app-header__actions">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  &__logo {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    text-decoration: none;
  }

  &__link {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover,
    &.router-link-active {
      color: var(--color-primary);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}
</style>
