import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/entities/user/model/users.store'
import { type Permission, rolePermissions } from '@/entities/user/model/types'

export function usePermissions() {
  const usersStore = useUsersStore()
  const { currentUser } = storeToRefs(usersStore)

  const userPermissions = computed(() => {
    if (!currentUser.value?.role) return []
    return rolePermissions[currentUser.value.role]
  })

  function hasPermission(permission: Permission): boolean {
    return userPermissions.value.includes(permission)
  }

  function hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(permission))
  }

  function hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(permission))
  }

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}
