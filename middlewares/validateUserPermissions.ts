interface User {
  permissions?: string[]
  roles?: string[]
}

interface ValidateUserPermissionsParams {
  user: User
  permissions?: string[]
  roles?: string[]
}

export function validateUserPermissions({
  user,
  permissions = [],
  roles = []
}: ValidateUserPermissionsParams) {

  if (permissions.length > 0) {
    const hasAllPermissions = permissions.every(permission => {
      return user.permissions?.includes(permission)
    })

    return !!hasAllPermissions
  }

  if (roles.length > 0) {
    const hasAllRoles = roles.some(role => {
      return user.roles?.includes(role)
    })

    return !!hasAllRoles
  }

  return true
}