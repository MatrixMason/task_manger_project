export const storage = {
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
    } catch (_e) {
      document.cookie = `${key}=${value};path=/;max-age=31536000`
    }
  },

  get(key: string): string | null {
    try {
      const value = localStorage.getItem(key)
      if (value) return value
    } catch (_e) {
      const cookies = document.cookie.split(';')
      const cookie = cookies.find((c) => c.trim().startsWith(`${key}=`))
      if (cookie) {
        return cookie.split('=')[1]
      }
    }
    return null
  },

  remove(key: string) {
    try {
      localStorage.removeItem(key)
    } catch (_e) {
      document.cookie = `${key}=;path=/;max-age=0`
    }
  },
}
