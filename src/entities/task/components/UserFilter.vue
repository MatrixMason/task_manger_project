<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/entities/user/model/users.store'
import { ref, computed, onMounted } from 'vue'
import BaseSelect from '@/shared/ui/Select/BaseSelect.vue'

const emit = defineEmits<{
  (e: 'filter', userId: number | null): void
}>()

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const selectedUser = ref('')

const userOptions = computed(() => [
  { value: '', label: 'Все пользователи' },
  ...users.value.map(user => ({
    value: user.id.toString(),
    label: `${user.name} (${user.role})`
  }))
])

onMounted(async () => {
  if (users.value.length === 0) {
    await usersStore.fetchUsers()
  }
})

function handleChange(userId: string) {
  selectedUser.value = userId
  emit('filter', userId ? Number(userId) : null)
}
</script>

<template>
  <div class="user-filter">
    <BaseSelect
      v-model="selectedUser"
      :options="userOptions"
      class="task-filters__select"
      @update:modelValue="handleChange"
    />
  </div>
</template>

<style scoped lang="scss">
.user-filter {
  :deep(.task-filters__select) {
    min-width: 200px;
  }
}
</style>
