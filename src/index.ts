// Main exports for the convex-workspaces package
export { convexWorkspaces } from "./convexWorkspaces";
export { initializePersonalWorkspace } from "./utils/initializePersonalWorkspace";

// Export schemas
import { workspacesSchema as workspaces } from "./workspaces/schema";
import { projectsSchema as projects } from "./projects/schema";


// Combined schema for easy import
export const workspacesSchema = {
  ...workspaces,
  ...projects,
};

// Export types
export type { UserRole, ProjectRole } from "./utils/permissions";
