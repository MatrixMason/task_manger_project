import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { loadFromLocalStorage, saveToLocalStorage } from '@/shared/lib/local-storage'

type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(loadFromLocalStorage('theme', 'light'))

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function applyTheme(newTheme: Theme) {
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function initTheme() {
    const savedTheme = loadFromLocalStorage('theme', 'light') as Theme
    theme.value = savedTheme
    applyTheme(savedTheme)
  }

  watch(
    () => theme.value,
    (newTheme) => {
      saveToLocalStorage('theme', newTheme)
      applyTheme(newTheme)
    },
  )

  return {
    theme,
    toggleTheme,
    initTheme,
  }
})
