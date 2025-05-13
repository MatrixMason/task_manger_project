<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/entities/user/model/users.store'
import { usePermissions } from '@/features/Auth/lib/usePermissions'
import type { User } from '@/entities/user/model/types'
import type { RegisterData } from '@/shared/api/users'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'
import UserFormModal from '@/features/UserManagement/ui/UserFormModal.vue'
import ConfirmModal from '@/shared/ui/Modal/ConfirmModal.vue'
import ToastNotification from '@/shared/ui/Notification/ToastNotification.vue'

const usersStore = useUsersStore()
const { hasPermission } = usePermissions()

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showUserModal = ref(false)
const selectedUser = ref<User | undefined>()
const showDeleteConfirm = ref(false)
const userToDelete = ref<User | undefined>()
const notification = ref({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

const roleOptions = {
  admin: 'Администратор',
  manager: 'Менеджер',
  developer: 'Разработчик',
  designer: 'Дизайнер',
}

onMounted(async () => {
  try {
    loading.value = true
    users.value = await usersStore.fetchUsers()
  } catch (err) {
    error.value = 'Ошибка при загрузке пользователей'
    console.error(err)
  } finally {
    loading.value = false
  }
})

function openEditModal(user: User) {
  selectedUser.value = user
  showUserModal.value = true
}

function confirmDelete(user: User) {
  userToDelete.value = user
  showDeleteConfirm.value = true
}

async function handleUserSubmit(userData: Omit<User, 'id'> & { password?: string }) {
  try {
    if (selectedUser.value) {
      const { password, ...updateData } = userData
      await usersStore.updateUser(selectedUser.value.id, updateData)
      users.value = await usersStore.fetchUsers()
      notification.value = {
        show: true,
        message: 'Пользователь успешно обновлен',
        type: 'success',
      }
      showUserModal.value = false
      selectedUser.value = undefined
    } else {
      if (!userData.password) {
        notification.value = {
          show: true,
          message: 'Пароль обязателен при создании пользователя',
          type: 'error',
        }
        return
      }
      const { name, email, role, password } = userData
      const createdUser = await usersStore.createUser({
        name,
        email,
        role,
        password,
      } as RegisterData)
      users.value = [...users.value, createdUser]
      notification.value = {
        show: true,
        message: 'Пользователь успешно создан',
        type: 'success',
      }
      showUserModal.value = false
      selectedUser.value = undefined
    }
  } catch (err) {
    notification.value = {
      show: true,
      message: err instanceof Error ? err.message : 'Не удалось создать пользователя',
      type: 'error',
    }
    console.error(err)
  }
}

async function handleDelete(userId: string) {
  try {
    await usersStore.deleteUser(userId)
    users.value = await usersStore.fetchUsers()
    showDeleteConfirm.value = false
    userToDelete.value = undefined
    notification.value = {
      show: true,
      message: 'Пользователь успешно удален',
      type: 'success',
    }
  } catch (err) {
    notification.value = {
      show: true,
      message: err instanceof Error ? err.message : 'Ошибка при удалении пользователя',
      type: 'error',
    }
    console.error(err)
  }
}
</script>

<template>
  <div class="team-page">
    <header class="team-page__header">
      <h1>Управление командой</h1>
      <BaseButton
        v-if="hasPermission('users.create')"
        variant="primary"
        @click="showUserModal = true"
      >
        Добавить участника
      </BaseButton>
    </header>

    <div class="team-page__content">
      <div v-if="loading" class="team-page__loading">Загрузка участников команды...</div>
      <div v-else-if="error" class="team-page__error">
        {{ error }}
      </div>
      <div v-else class="team-members">
        <div v-for="user in users" :key="user.id" class="team-member">
          <div class="team-member__info">
            <div class="team-member__name">{{ user.name }}</div>
            <div class="team-member__email">{{ user.email }}</div>
            <div class="team-member__role">
              <span class="role-badge" :class="'role-' + user.role">{{ roleOptions[user.role] }}</span>
            </div>
            <div class="team-member__actions">
              <BaseButton
                v-if="hasPermission('users.edit')"
                variant="secondary"
                size="sm"
                class="edit-button"
                @click="openEditModal(user)"
              >Редактировать</BaseButton>
              <BaseButton
                v-if="hasPermission('users.delete')"
                variant="danger"
                size="sm"
                class="delete-button"
                @click="confirmDelete(user)"
              >Удалить</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UserFormModal
      v-model:show="showUserModal"
      :edit-user="selectedUser"
      @close="selectedUser = undefined"
      @submit="handleUserSubmit"
    />

    <ConfirmModal
      v-model:show="showDeleteConfirm"
      title="Удалить участника"
      :message="
        userToDelete ? `Вы действительно хотите удалить участника ${userToDelete.name}?` : ''
      "
      @confirm="() => userToDelete && handleDelete(userToDelete.id)"
    />
  </div>
  <ToastNotification
    v-model:show="notification.show"
    :type="notification.type"
    :message="notification.message"
  />
</template>

<style lang="scss" scoped>
.team-page {
  padding: 2rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text-primary);
    }
  }

  &__loading,
  &__error {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }

  &__error {
    color: var(--color-error);
  }
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-member {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__name {
    font-weight: 500;
    color: var(--text-primary);
    min-width: 150px;
  }

  &__email {
    color: var(--text-secondary);
    font-size: 0.875rem;
    flex: 1;
  }

  &__role {
    margin-top: 0;
    
    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      
      &.role-admin {
        background-color: #fecaca;
        color: #991b1b;
      }
      
      &.role-manager {
        background-color: #bfdbfe;
        color: #1e40af;
      }
      
      &.role-developer {
        background-color: #bbf7d0;
        color: #166534;
      }
      
      &.role-designer {
        background-color: #ddd6fe;
        color: #5b21b6;
      }
    }
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    margin-left: 1rem;
  }
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
