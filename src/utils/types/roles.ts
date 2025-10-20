export const ROLE_HIERARCHY = { 
  admin: 3, 
  editor: 2, 
  viewer: 1 
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;
