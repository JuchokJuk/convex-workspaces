import { getWorkspaceByIdHandler, getWorkspaceById } from "./getWorkspaceById";
import { getWorkspacesByOwnerHandler, getWorkspacesByOwner } from "./getWorkspacesByOwner";
import { getPersonalWorkspaceHandler, getPersonalWorkspace } from "./getPersonalWorkspace";
import { getUserWorkspacesHandler, getUserWorkspaces } from "./getUserWorkspaces";

export const workspacesQueriesHandlers = {
  getWorkspaceByIdHandler,
  getWorkspacesByOwnerHandler,
  getPersonalWorkspaceHandler,
  getUserWorkspacesHandler,
};

export const workspacesQueries = {
  getWorkspaceById,
  getWorkspacesByOwner,
  getPersonalWorkspace,
  getUserWorkspaces,
};
