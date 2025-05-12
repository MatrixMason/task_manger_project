<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { User } from '@/entities/user/model/types'
import { usersApi } from '@/shared/api/users'
import BaseModal from '@/shared/ui/Modal/BaseModal.vue'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'

interface Props {
  show: boolean
  editUser?: User
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', userData: Omit<User, 'id'> & { password?: string }): void
  (e: 'update:show', value: boolean): void
}>()

const formData = ref({
  name: '',
  email: '',
  password: '',
  role: 'developer' as User['role'],
})

const errors = ref({
  name: '',
  email: '',
  password: '',
  role: '',
  submit: '',
})

const isLoading = ref(false)
const isEditMode = computed(() => !!props.editUser)

const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'developer', label: 'Разработчик' },
  { value: 'designer', label: 'Дизайнер' },
]

watch(
  () => props.editUser,
  (user) => {
    if (user) {
      formData.value = {
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

function resetForm() {
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: 'developer',
  }
  errors.value = {
    name: '',
    email: '',
    password: '',
    role: '',
    submit: '',
  }
}

function validateForm(): boolean {
  let isValid = true
  errors.value = {
    name: '',
    email: '',
    password: '',
    role: '',
    submit: '',
  }

  if (!formData.value.name.trim()) {
    errors.value.name = 'Имя обязательно'
    isValid = false
  }

  if (!formData.value.email.trim()) {
    errors.value.email = 'Email обязателен'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Некорректный email'
    isValid = false
  }

  if (!isEditMode.value && !formData.value.password.trim()) {
    errors.value.password = 'Пароль обязателен для нового пользователя'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return

  isLoading.value = true
  errors.value.submit = ''

  try {
    if (isEditMode.value && props.editUser) {
      const { password, ...updateData } = formData.value
      await usersApi.updateUser(props.editUser.id, updateData)
      emit('submit', {
        ...updateData,
        createdAt: props.editUser.createdAt,
        updatedAt: new Date().toISOString(),
      })
      emit('update:show', false)
      resetForm()
    } else {
      try {
        const now = new Date().toISOString()
        await usersApi.createUser(formData.value)
        emit('submit', { ...formData.value, createdAt: now, updatedAt: now })
        emit('update:show', false)
        resetForm()
      } catch (error) {
        if (error instanceof Error && error.message.includes('email уже существует')) {
          errors.value.email = error.message
        } else {
          throw error
        }
      }
    }
  } catch (error) {
    errors.value.submit = error instanceof Error ? error.message : 'Произошла ошибка'
  } finally {
    isLoading.value = false
  }
}

function handleClose() {
  emit('update:show', false)
  resetForm()
}
</script>

<template>
  <BaseModal
    :show="show"
    :title="isEditMode ? 'Редактировать пользователя' : 'Добавить пользователя'"
    @update:show="(value) => emit('update:show', value)"
  >
    <form class="user-form">
      <div class="form-group">
        <BaseInput
          v-model="formData.name"
          label="Имя"
          placeholder="Введите имя"
          :error="errors.name"
        />
      </div>

      <div class="form-group">
        <BaseInput
          v-model="formData.email"
          label="Email"
          type="email"
          placeholder="Введите email"
          :error="errors.email"
        />
      </div>

      <div class="form-group" v-if="!isEditMode">
        <BaseInput
          v-model="formData.password"
          label="Пароль"
          type="password"
          placeholder="Введите пароль"
          :error="errors.password"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Роль</label>
        <select v-model="formData.role" class="form-select">
          <option v-for="option in roleOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <div v-if="errors.role" class="form-error">{{ errors.role }}</div>
      </div>

      <div v-if="errors.submit" class="form-error submit-error">
        {{ errors.submit }}
      </div>

      <div class="form-actions">
        <BaseButton type="button" variant="secondary" @click="handleClose"> Отмена </BaseButton>
        <BaseButton type="button" :loading="isLoading" @click="handleSubmit">
          {{ isEditMode ? 'Сохранить' : 'Создать' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<style lang="scss" scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.5;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
}

.error-message {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
