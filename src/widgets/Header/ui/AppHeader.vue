<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/entities/user/model/users.store'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'

defineOptions({
  name: 'AppHeader'
})

const router = useRouter()
const usersStore = useUsersStore()

async function handleLogout() {
  await usersStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="header">
    <nav class="nav">
      <router-link to="/projects" class="nav-link">Проекты</router-link>
      <router-link to="/" class="nav-link">Доска задач</router-link>
    </nav>
    
    <div class="user-actions">
      <BaseButton @click="handleLogout" variant="secondary">
        Выйти
      </BaseButton>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: var(--color-text);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-background-mute);
  }

  &.router-link-active {
    color: var(--color-primary);
    background-color: var(--color-background-mute);
  }
}

.user-actions {
  display: flex;
  align-items: center;
}
</style>
