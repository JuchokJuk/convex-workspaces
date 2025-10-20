// Main exports for the convex-workspaces package
export { convexWorkspaces } from "./convexWorkspaces";
export { initializePersonalWorkspace } from "./utils/initializePersonalWorkspace";

// Export schemas
import { workspaces } from "./workspaces/schema";
import { memberships } from "./memberships/schema";
import { entities } from "./entities/schema";
import { entityAccess } from "./entityAccess/schema";

// Combined schema for easy import
export const workspacesTables = {
  workspaces,
  memberships,
  entities,
  entityAccess,
};

export type WorkspacesTables = typeof workspacesTables;

// Export types
export type {
  UserRole,
  ProjectAccessLevel,
  NonEmptyString,
  AnyConvexCtx,
} from "./types";

// Deprecated legacy exports (kept for backward-compatibility)
export type { UserRole as DeprecatedUserRole } from "./types";
export type { ProjectAccessLevel as DeprecatedProjectRole } from "./types";
