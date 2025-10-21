import {
  createWorkspace,
  updateWorkspace,
  assembleRemoveWorkspace,
} from "./workspaces/mutations";
import {
  getWorkspaceById,
  getWorkspacesByOwner,
  getPersonalWorkspace,
  getUserWorkspaces,
} from "./workspaces/queries";

import {
  createMembership,
  updateMembershipRole,
  removeMembership,
  removeUserFromWorkspace,
} from "./memberships/mutations";
import {
  getMembershipByWorkspaceAndUser,
  getMembershipsByWorkspace,
  getMembershipsByUser,
  getCurrentUserMembership,
} from "./memberships/queries";

import { createEntity, assembleRemoveEntity } from "./entities/mutations";
import {
  getEntityById,
  getEntitiesByWorkspace,
  checkEntityAccess,
  getUserAccessibleEntities,
} from "./entities/queries";

import {
  createEntityAccess,
  updateEntityAccessLevel,
  removeEntityAccess,
} from "./entityAccess/mutations";
import {
  getEntityAccessByEntityAndWorkspace,
  getEntityAccessByEntity,
  getEntityAccessByWorkspace,
  getUserEffectiveAccess,
} from "./entityAccess/queries";

import {
  checkUserPermission,
  checkEntityPermission,
  getUserRoleInWorkspace,
  getUserRoleForEntity,
} from "./utils/permissions";
import type {
  GenericMutationCtx,
  GenericDataModel,
  IdField,
} from "convex/server";

export function convexWorkspaces<T extends GenericDataModel>({
  callbacks,
}: {
  callbacks?: {
    onWorkspaceRemoved?: (
      ctx: GenericMutationCtx<T>,
      args: { entityIds: IdField<"entities">["_id"][] }
    ) => Promise<void>;
    onEntityRemoved?: (
      ctx: GenericMutationCtx<T>,
      args: { entityId: IdField<"entities">["_id"] }
    ) => Promise<void>;
  };
}) {
  const removeWorkspace = assembleRemoveWorkspace(
    callbacks?.onWorkspaceRemoved
  );
  const removeEntity = assembleRemoveEntity(callbacks?.onEntityRemoved);

  return {
    // Workspaces
    createWorkspace,
    updateWorkspace,
    removeWorkspace,
    getWorkspaceById,
    getWorkspacesByOwner,
    getPersonalWorkspace,
    getUserWorkspaces,

    // Memberships
    createMembership,
    updateMembershipRole,
    removeMembership,
    removeUserFromWorkspace,
    getMembershipByWorkspaceAndUser,
    getMembershipsByWorkspace,
    getMembershipsByUser,
    getCurrentUserMembership,

    // Entities
    createEntity,
    removeEntity,
    getEntityById,
    getEntitiesByWorkspace,
    checkEntityAccess,
    getUserAccessibleEntities,

    // Entity Access
    createEntityAccess,
    updateEntityAccessLevel,
    removeEntityAccess,
    getEntityAccessByEntityAndWorkspace,
    getEntityAccessByEntity,
    getEntityAccessByWorkspace,
    getUserEffectiveAccess,

    // Permissions
    checkUserPermission,
    checkEntityPermission,
    getUserRoleInWorkspace,
    getUserRoleForEntity,
  };
}
