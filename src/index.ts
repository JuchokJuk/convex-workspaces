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

// Export types
export type {
  UserRole,
  ProjectAccessLevel,
} from "./types";
