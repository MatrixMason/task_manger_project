<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/entities/user/model/users.store'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'

const router = useRouter()
const usersStore = useUsersStore()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleSubmit() {
  try {
    await usersStore.login({ email: email.value, password: password.value })
    router.push('/board')
  } catch {
    error.value = 'Неверный email или пароль'
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-form" @submit.prevent="handleSubmit">
      <h1>Вход в систему</h1>

      <div class="form-group">
        <BaseInput
          v-model="email"
          type="email"
          label="Email"
          placeholder="Введите email"
          required
        />
      </div>

      <div class="form-group">
        <BaseInput
          v-model="password"
          type="password"
          label="Пароль"
          placeholder="Введите пароль"
          required
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <BaseButton type="submit" variant="primary" class="login-button">
        {{ usersStore.isLoading ? 'Вход...' : 'Войти' }}
      </BaseButton>

      <div class="form-footer">
        Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-background);
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    margin-bottom: 2rem;
    text-align: center;
    color: var(--color-heading);
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.error-message {
  color: var(--color-error);
  margin-bottom: 1rem;
  text-align: center;
}

.login-button {
  width: 100%;
}

.form-footer {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;

  a {
    color: var(--color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
