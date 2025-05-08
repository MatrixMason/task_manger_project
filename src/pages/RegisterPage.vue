<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/entities/user/model/users.store'
import BaseInput from '@/shared/ui/Input/BaseInput.vue'
import BaseButton from '@/shared/ui/Button/BaseButton.vue'
import BaseSelect from '@/shared/ui/Select/BaseSelect.vue'
type UserRole = 'developer' | 'manager' | 'designer'

const router = useRouter()
const usersStore = useUsersStore()

const formData = ref({
  name: '',
  email: '',
  password: '',
  role: 'developer' as UserRole,
})

const error = ref<string | null>(null)

async function handleSubmit() {
  if (!formData.value.email || !formData.value.password || !formData.value.name) {
    error.value = 'Пожалуйста, заполните все обязательные поля'
    return
  }

  try {
    await usersStore.register(formData.value)
    await router.push('/board')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка регистрации'
  }
}
</script>

<template>
  <div class="register-page">
    <form class="register-form" @submit.prevent="handleSubmit">
      <h1>Регистрация</h1>

      <div class="form-group">
        <BaseInput
          v-model="formData.name"
          type="text"
          label="Имя"
          placeholder="Введите ваше имя"
          required
        />
      </div>

      <div class="form-group">
        <BaseInput
          v-model="formData.email"
          type="email"
          label="Email"
          placeholder="Введите email"
          required
        />
      </div>

      <div class="form-group">
        <BaseInput
          v-model="formData.password"
          type="password"
          label="Пароль"
          placeholder="Придумайте пароль"
          required
        />
      </div>

      <div class="form-group">
        <BaseSelect
          v-model="formData.role"
          label="Роль"
          :options="[
            { value: 'developer' as const, label: 'Разработчик' },
            { value: 'manager' as const, label: 'Менеджер' },
            { value: 'designer' as const, label: 'Дизайнер' },
          ]"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <BaseButton type="submit" variant="primary" class="register-button">
        {{ usersStore.isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </BaseButton>

      <div class="form-footer">Уже есть аккаунт? <router-link to="/login">Войти</router-link></div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.register-page {
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

.register-form {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--color-background-form);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  [data-theme='dark'] & {
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.5),
      0 2px 4px -1px rgba(255, 255, 255, 0.06);
  }

  h1 {
    margin-bottom: 2rem;
    text-align: center;
    color: var(--color-heading);
  }
}

.form-group {
  margin-bottom: 1rem;
  width: 100%;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background);
  color: var(--color-text);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}

.error-message {
  color: var(--color-error);
  margin-bottom: 1rem;
  text-align: center;
}

.register-button {
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
