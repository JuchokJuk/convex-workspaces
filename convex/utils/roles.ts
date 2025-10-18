// Утилиты для работы с ролями и правами доступа

export type Role = "admin" | "editor" | "viewer";

export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
};

/**
 * Определяет эффективную роль на основе роли пользователя и уровня доступа к проекту
 * Использует принцип наименьших привилегий (минимальная из двух ролей)
 */
export function getEffectiveRole(userRole: Role, accessLevel: Role): Role {
  const userLevel = ROLE_HIERARCHY[userRole];
  const accessLevelValue = ROLE_HIERARCHY[accessLevel];
  
  const effectiveLevel = Math.min(userLevel, accessLevelValue);
  
  switch (effectiveLevel) {
    case 3: return "admin";
    case 2: return "editor";
    default: return "viewer";
  }
}

/**
 * Проверяет, может ли пользователь с данной ролью редактировать
 */
export function canEdit(role: Role): boolean {
  return role === "editor" || role === "admin";
}

/**
 * Проверяет, является ли роль административной
 */
export function isAdmin(role: Role): boolean {
  return role === "admin";
}

/**
 * Проверяет, может ли пользователь с данной ролью удалять
 */
export function canDelete(role: Role): boolean {
  return role === "admin";
}

/**
 * Получает максимальную роль из массива ролей
 */
export function getMaxRole(roles: Role[]): Role {
  let maxRole: Role = "viewer";
  
  for (const role of roles) {
    if (ROLE_HIERARCHY[role] > ROLE_HIERARCHY[maxRole]) {
      maxRole = role;
    }
  }
  
  return maxRole;
}

