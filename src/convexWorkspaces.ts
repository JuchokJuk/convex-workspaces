import {
  getPersonalWorkspace,
  getUserWorkspaces,
  getWorkspace,
  getWorkspaceRole,
} from "./workspaces/queries";
import {
  createWorkspace,
  addUserToWorkspace,
  assembleDeleteWorkspace,
} from "./workspaces/mutations";
import {
  getProject,
  getUserProjectsWithRoles,
  getProjectRole,
  canEditProject,
  canDeleteProject,
} from "./projects/queries";
import {
  createProject,
  shareProject,
  assembleDeleteProject,
} from "./projects/mutations";

export function convexWorkspaces({ callbacks }: { callbacks?: any } = {}) {
  return {
    // Workspace queries
    getPersonalWorkspace,
    getUserWorkspaces,
    getWorkspace,
    getWorkspaceRole,
    // Workspace mutations
    createWorkspace,
    addUserToWorkspace,
    deleteWorkspace: assembleDeleteWorkspace(callbacks?.onWorkspaceDelete),
    // Project queries
    getProject,
    getUserProjectsWithRoles,
    getProjectRole,
    canEditProject,
    canDeleteProject,
    // Project mutations
    createProject,
    shareProject,
    deleteProject: assembleDeleteProject(callbacks?.onProjectDelete),
  };
}

