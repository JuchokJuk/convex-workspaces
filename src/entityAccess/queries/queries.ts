import { getEntityAccessByEntityAndWorkspaceHandler, getEntityAccessByEntityAndWorkspace } from "./getEntityAccessByEntityAndWorkspace";
import { getEntityAccessByEntityHandler, getEntityAccessByEntity } from "./getEntityAccessByEntity";
import { getEntityAccessByWorkspaceHandler, getEntityAccessByWorkspace } from "./getEntityAccessByWorkspace";
import { getUserEffectiveAccessHandler, getUserEffectiveAccess } from "./getUserEffectiveAccess";

export const entityAccessQueriesHandlers = {
  getEntityAccessByEntityAndWorkspaceHandler,
  getEntityAccessByEntityHandler,
  getEntityAccessByWorkspaceHandler,
  getUserEffectiveAccessHandler,
};

export const entityAccessQueries = {
  getEntityAccessByEntityAndWorkspace,
  getEntityAccessByEntity,
  getEntityAccessByWorkspace,
  getUserEffectiveAccess,
};
