import {
  checkEntityAccessHandler,
  checkEntityAccess,
} from "./checkEntityAccess";
import {
  getEntitiesByWorkspaceHandler,
  getEntitiesByWorkspace,
} from "./getEntitiesByWorkspace";
import { getEntityByIdHandler, getEntityById } from "./getEntityById";
import {
  getUserAccessibleEntitiesHandler,
  getUserAccessibleEntities,
} from "./getUserAccessibleEntities";

export const entitiesQuerieshandlers = {
  checkEntityAccessHandler,
  getEntitiesByWorkspaceHandler,
  getEntityByIdHandler,
  getUserAccessibleEntitiesHandler,
};
export const entitiesQueries = {
  checkEntityAccess,
  getEntitiesByWorkspace,
  getEntityById,
  getUserAccessibleEntities,
};
