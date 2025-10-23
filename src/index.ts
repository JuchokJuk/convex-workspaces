// Main exports for the convex-workspaces package
export { convexWorkspaces } from "./convexWorkspaces";
export { initializePersonalWorkspace } from "./utils/initializePersonalWorkspace";

// Export schemas
import { workspaces } from "./workspaces/workspaces";
import { memberships } from "./memberships/memberships";
import { entities } from "./entities/entities";
import { entityAccess } from "./entityAccess/entityAccess";

// Combined schema for easy import
export const workspacesTables = {
  workspaces: workspaces.schema,
  memberships: memberships.schema,
  entities: entities.schema,
  entityAccess: entityAccess.schema,
};

// Export types
export type { UserRole, ProjectAccessLevel } from "./types";
