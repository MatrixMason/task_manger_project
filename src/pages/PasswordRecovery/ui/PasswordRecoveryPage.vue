<template>
  <div class="password-recovery-page">
    <form class="recovery-form" @submit.prevent="handleSubmit">
      <h1>Восстановление пароля</h1>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="!emailVerified" class="form-group">
        <BaseInput v-model="formData.email" type="email" label="Email" required :error="error" />
      </div>
      <div v-else class="form-group">
        <BaseInput
          v-model="formData.newPassword"
          type="password"
          label="Новый пароль"
          required
          :error="error"
        />
      </div>
      <div class="form-actions">
        <BaseButton type="submit" variant="primary" :loading="isLoading">
          {{ emailVerified ? 'Сохранить новый пароль' : 'Продолжить' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/entities/user/model/users.store'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'

const router = useRouter()
const usersStore = useUsersStore()
const { isLoading, error } = storeToRefs(usersStore)

const emailVerified = ref(false)
const successMessage = ref('')
const formData = ref({
  email: '',
  newPassword: '',
})

async function handleSubmit() {
  error.value = null
  successMessage.value = ''

  try {
    if (!emailVerified.value) {
      const exists = await usersStore.checkEmailExists(formData.value.email)
      if (exists) {
        emailVerified.value = true
        successMessage.value = 'Email подтвержден. Введите новый пароль.'
      } else {
        error.value = 'Пользователь с таким email не найден'
      }
    } else {
      await usersStore.updatePassword(formData.value.email, formData.value.newPassword)
      successMessage.value =
        'Пароль успешно обновлен! Сейчас вы будете перенаправлены на страницу входа.'
      formData.value.newPassword = ''
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  } catch (e) {
    console.error('Password recovery failed:', e)
    if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'Произошла ошибка при восстановлении пароля'
    }
  }
}
</script>

<style lang="scss" scoped>
.password-recovery-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-background);
  padding: 0 1rem;

  form {
    width: 100%;
  }
}

.recovery-form {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  background-color: var(--color-background-form);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  [data-theme='dark'] & {
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.5),
      0 2px 4px -1px rgba(255, 255, 255, 0.06);
  }

  h1 {
    margin: 0 0 2rem;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    color: var(--text-primary);
  }
}

.form-group {
  margin-bottom: 1rem;
  width: 100%;
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.success-message,
.error-message {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  text-align: center;
}

.success-message {
  background-color: var(--color-success-bg, #d1fae5);
  color: var(--color-success, #059669);
  border: 1px solid var(--color-success-border, #34d399);

  [data-theme='dark'] & {
    background-color: rgba(5, 150, 105, 0.1);
    border-color: rgba(52, 211, 153, 0.2);
  }
}

.error-message {
  background-color: var(--color-error-bg, #fee2e2);
  color: var(--color-error, #dc2626);
  border: 1px solid var(--color-error-border, #f87171);
  text-align: center;
  margin-top: 1rem;

  [data-theme='dark'] & {
    background-color: rgba(220, 38, 38, 0.1);
    border-color: rgba(248, 113, 113, 0.2);
  }
}

.success-message {
  color: var(--color-success);
  text-align: center;
  margin-top: 1rem;
}
</style>
