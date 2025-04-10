<script setup lang="ts">
import { ref, defineComponent } from 'vue'

defineComponent({
  name: 'UsersPage',
})

const users = ref([
  { id: 1, name: 'Иван Петров', role: 'Разработчик' },
  { id: 2, name: 'Анна Сидорова', role: 'Дизайнер' },
])
</script>

<template>
  <div class="users-page">
    <header class="users-page__header">
      <h1>Пользователи</h1>
      <button class="btn btn--primary">Добавить пользователя</button>
    </header>

    <div class="users-list">
      <div v-for="user in users" :key="user.id" class="user-card">
        <h3>{{ user.name }}</h3>
        <p>{{ user.role }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.users-page {
  padding: 2rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
}

.users-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 0.5rem;
  }

  p {
    color: var(--text-secondary);
    margin: 0;
  }
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;

  &--primary {
    background: var(--primary-color);
    color: white;

    &:hover {
      filter: brightness(0.95);
    }
  }
}
</style>
