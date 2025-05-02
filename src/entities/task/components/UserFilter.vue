<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/entities/user/model/users.store'
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'filter', userId: number | null): void
}>()

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const selectedUser = ref<number | null>(null)

onMounted(async () => {
  if (users.value.length === 0) {
    await usersStore.fetchUsers()
  }
})

function handleChange(userId: string) {
  selectedUser.value = userId ? Number(userId) : null
  emit('filter', selectedUser.value)
}
</script>

<template>
  <div class="user-filter">
    <select
      class="user-filter__select"
      :value="selectedUser"
      @change="handleChange(($event.target as HTMLSelectElement).value)"
    >
      <option value="">Все пользователи</option>
      <option v-for="user in users" :key="user.id" :value="user.id">
        {{ user.name }} ({{ user.role }})
      </option>
    </select>
  </div>
</template>

<style scoped lang="scss">
.user-filter {
  &__select {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--background-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
    width: 200px;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    option {
      padding: 0.5rem;
    }
  }
}
</style>
