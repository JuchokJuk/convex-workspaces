// Main exports for the convex-workspaces package
export { convexWorkspaces } from "./convexWorkspaces";
export { initializePersonalWorkspace } from "./utils/initializePersonalWorkspace";

// Export schemas
import { workspacesSchema } from "./workspaces/schema";
import { projectsSchema } from "./projects/schema";

export { workspacesSchema, projectsSchema };

// Combined schema for easy import
export const workspaceSchema = {
  ...workspacesSchema,
  ...projectsSchema,
};

// Export types
export type { UserRole, ProjectRole } from "./utils/permissions";

// Re-export Convex types that users might need
export type { Id } from "./convex-stubs";
export type { FunctionReturnType } from "convex/server";