<template>
  <div class="login-page">
    <div class="login-form">
      <h1>Вход в систему</h1>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <BaseInput
            v-model="formData.email"
            type="email"
            label="Email"
            required
            :error="error"
          />
        </div>
        <div class="form-group">
          <BaseInput
            v-model="formData.password"
            type="password"
            label="Пароль"
            required
            :error="error"
          />
        </div>
        <div class="form-actions">
          <BaseButton
            type="submit"
            variant="primary"
            :loading="isLoading"
          >
            Войти
          </BaseButton>
        </div>
      </form>
    </div>
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

const formData = ref({
  email: '',
  password: ''
})

async function handleSubmit() {
  try {
    await usersStore.login(formData.value)
    router.push('/')
  } catch (e) {
    console.error('Failed to login:', e)
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--bg-primary);
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

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
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
</style>
