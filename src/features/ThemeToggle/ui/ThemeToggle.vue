<script setup lang="ts">
import { useThemeStore } from '@/shared/model/theme.store'
import { ref } from 'vue'

const themeStore = useThemeStore()
const isPressed = ref(false)
</script>

<template>
  <button
    class="theme-toggle"
    :title="themeStore.theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'"
    @click="themeStore.toggleTheme"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
  >
    <div class="theme-toggle__icon" :class="{ 'theme-toggle__icon--pressed': isPressed }">
      <svg
        v-if="themeStore.theme === 'light'"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    </div>
  </button>
</template>

<style lang="scss" scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
  padding: 0;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(0) translateZ(0);
    }

    &--pressed {
      transform: translateY(1px) translateZ(0);
    }
  }
}
</style>
