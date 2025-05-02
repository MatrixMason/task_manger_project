<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUsersStore } from '@/entities/user/model/users.store'
import AppHeader from '@/widgets/Header/ui/AppHeader.vue'

const usersStore = useUsersStore()
</script>

<template>
  <AppHeader v-if="usersStore.isAuthenticated" />
  <main>
    <RouterView />
  </main>
</template>

<style lang="scss">
body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: #f5f5f5;
}

.header {
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;

  nav {
    display: flex;
    gap: 1rem;

    a {
      color: #666;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: #e9ecef;
      }

      &.router-link-active {
        color: var(--primary-color);
        font-weight: 500;
        background-color: #e8f5e9;
      }
    }
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
