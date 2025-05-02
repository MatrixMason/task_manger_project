<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/entities/user/model/users.store'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'

defineOptions({
  name: 'AppHeader',
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
      <router-link to="/board" class="nav-link">Доска задач</router-link>
    </nav>

    <div class="user-actions">
      <BaseButton @click="handleLogout" variant="secondary"> Выйти </BaseButton>
    </div>
  </header>
</template>

<style lang="scss" scoped>
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
}

.user-actions {
  display: flex;
  align-items: center;

  :deep(.button) {
    background-color: transparent;
    color: #dc3545;
    border: 1px solid #dc3545;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #dc3545;
      color: white;
    }
  }
}
</style>
