import { UserRole, ROLE_HIERARCHY } from "../types/roles";

export function getMinRole(role1: UserRole, role2: UserRole): UserRole {
  return ROLE_HIERARCHY[role1] <= ROLE_HIERARCHY[role2] ? role1 : role2;
}
