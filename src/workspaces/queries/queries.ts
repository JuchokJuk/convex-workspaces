import { getWorkspaceByIdHandler, getWorkspaceById } from "./getWorkspaceById";
import { getWorkspacesByOwnerHandler, getWorkspacesByOwner } from "./getWorkspacesByOwner";
import { getPersonalWorkspaceHandler, getPersonalWorkspace } from "./getPersonalWorkspace";
import { getPersonalWorkspaceByUserIdHandler, getPersonalWorkspaceByUserId } from "./getPersonalWorkspaceByUserId";
import { getUserWorkspacesHandler, getUserWorkspaces } from "./getUserWorkspaces";

export const workspacesQueriesHandlers = {
  getWorkspaceByIdHandler,
  getWorkspacesByOwnerHandler,
  getPersonalWorkspaceHandler,
  getPersonalWorkspaceByUserIdHandler,
  getUserWorkspacesHandler,
};

export const workspacesQueries = {
  getWorkspaceById,
  getWorkspacesByOwner,
  getPersonalWorkspace,
  getPersonalWorkspaceByUserId,
  getUserWorkspaces,
};
