<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUsersStore } from '@/entities/user/model/users.store'
import AppHeader from '@/widgets/AppHeader/ui/AppHeader.vue'
import { useThemeStore } from '@/shared/model/theme.store'

const usersStore = useUsersStore()
const themeStore = useThemeStore()

// Инициализируем тему при загрузке приложения
themeStore.initTheme()
</script>

<template>
  <AppHeader v-if="usersStore.isAuthenticated" />
  <main>
    <RouterView />
  </main>
</template>

<style lang="scss">
@use '@/app/styles/theme';

body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
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
