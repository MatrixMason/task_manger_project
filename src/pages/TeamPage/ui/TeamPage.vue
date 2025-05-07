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
      <div v-if="loading" class="team-page__loading">
        Загрузка участников команды...
      </div>
      <div v-else-if="error" class="team-page__error">
        {{ error }}
      </div>
      <div v-else class="team-members">
        <div v-for="user in users" :key="user.id" class="team-member">
          <div class="team-member__info">
            <div class="team-member__name">{{ user.name }}</div>
            <div class="team-member__email">{{ user.email }}</div>
            <div class="team-member__role">
              <span class="role-badge" :class="'role-' + user.role">
                {{ user.role }}
              </span>
            </div>
          </div>
          <div class="team-member__actions">
            <BaseButton
              v-if="hasPermission('users.edit')"
              variant="secondary"
              size="sm"
              class="edit-button"
              @click="openEditModal(user)"
            >
              Редактировать
            </BaseButton>
            <BaseButton
              v-if="hasPermission('users.delete')"
              variant="danger"
              size="sm"
              class="delete-button"
              @click="confirmDelete(user)"
            >
              Удалить
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования пользователя -->
    <BaseModal
      v-model:show="showUserModal"
      :title="editingUser ? 'Редактировать участника' : 'Добавить участника'"
    >
      <form @submit.prevent="handleSubmit" class="user-form">
        <div class="form-group">
          <BaseInput
            v-model="formData.name"
            label="Имя"
            required
          />
        </div>
        <div class="form-group">
          <BaseInput
            v-model="formData.email"
            label="Email"
            type="email"
            required
          />
        </div>
        <div class="form-group">
          <BaseSelect
            v-model="formData.role"
            label="Роль"
            :options="roleOptions"
            required
          />
        </div>
        <div class="form-group" v-if="!editingUser">
          <BaseInput
            v-model="formData.password"
            label="Пароль"
            type="password"
            required
          />
        </div>
        <div class="form-actions">
          <BaseButton
            type="button"
            variant="secondary"
            @click="showUserModal = false"
          >
            Отмена
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
          >
            {{ editingUser ? 'Сохранить' : 'Добавить' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Модальное окно подтверждения удаления -->
    <ConfirmModal
      v-model:show="showDeleteConfirm"
      title="Удалить участника"
      :message="'Вы действительно хотите удалить участника ' + userToDelete?.name + '?'"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/entities/user/model/users.store'
import { usePermissions } from '@/features/Auth/lib/usePermissions'
import type { User, UserRole } from '@/entities/user/model/types'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'
import BaseModal from '@/shared/ui/Modal/BaseModal.vue'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'
import BaseSelect from '@/shared/ui/Select/BaseSelect.vue'
import ConfirmModal from '@/shared/ui/Modal/ConfirmModal.vue'

const usersStore = useUsersStore()
const { users, isLoading: loading, error } = storeToRefs(usersStore)
const { hasPermission } = usePermissions()

const showUserModal = ref(false)
const showDeleteConfirm = ref(false)
const editingUser = ref<User | null>(null)
const userToDelete = ref<User | null>(null)
const formData = ref({
  name: '',
  email: '',
  role: '' as UserRole,
  password: ''
})

const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'developer', label: 'Разработчик' },
  { value: 'designer', label: 'Дизайнер' }
]

onMounted(async () => {
  await usersStore.fetchUsers()
})

function openEditModal(user: User) {
  editingUser.value = user
  formData.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    password: ''
  }
  showUserModal.value = true
}

function confirmDelete(user: User) {
  userToDelete.value = user
  showDeleteConfirm.value = true
}

async function handleSubmit() {
  try {
    if (editingUser.value) {
      await usersStore.updateUser(editingUser.value.id, {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role
      })
    } else {
      await usersStore.createUser({
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
        password: formData.value.password
      })
    }
    showUserModal.value = false
    resetForm()
  } catch (e) {
    console.error('Failed to save user:', e)
  }
}

async function handleDelete() {
  if (!userToDelete.value) return

  try {
    await usersStore.deleteUser(userToDelete.value.id)
    showDeleteConfirm.value = false
    userToDelete.value = null
  } catch (e) {
    console.error('Failed to delete user:', e)
  }
}

function resetForm() {
  editingUser.value = null
  formData.value = {
    name: '',
    email: '',
    role: '' as UserRole,
    password: ''
  }
}
</script>

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
      font-weight: 600;
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
  display: grid;
  gap: 1rem;
}

.team-member {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--border-hover);
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__name {
    font-weight: 500;
    color: var(--text-primary);
  }

  &__email {
    color: var(--text-secondary);
  }

  &__role {
    .role-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: capitalize;

      &.role-admin {
        background: var(--color-primary-light);
        color: var(--color-primary);
      }

      &.role-manager {
        background: var(--color-success-light);
        color: var(--color-success);
      }

      &.role-developer {
        background: var(--color-warning-light);
        color: var(--color-warning);
      }

      &.role-designer {
        background: var(--color-info-light);
        color: var(--color-info);
      }
    }
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
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
