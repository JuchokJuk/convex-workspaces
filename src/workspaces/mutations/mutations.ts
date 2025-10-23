import { createWorkspaceHandler, createWorkspace } from "./createWorkspace";
import { updateWorkspaceHandler, updateWorkspace } from "./updateWorkspace";
import { assembleRemoveWorkspaceHandler, assembleRemoveWorkspace, OnWorkspaceRemovedCallback } from "./removeWorkspace";

export const workspacesMutations = {
  createWorkspace,
  updateWorkspace,
};

export const workspacesMutationsHandlers = {
  createWorkspaceHandler,
  updateWorkspaceHandler,
  assembleRemoveWorkspaceHandler,
};

export { assembleRemoveWorkspace };
export type { OnWorkspaceRemovedCallback };
