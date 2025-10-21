import { workspaces, type OnWorkspaceRemovedCallback } from "./workspaces";
import { memberships } from "./memberships";
import { entities, type OnEntityRemovedCallback } from "./entities";
import { entityAccess } from "./entityAccess";

import {
  checkUserPermission,
  checkEntityPermission,
  getUserRoleInWorkspace,
  getUserRoleForEntity,
} from "./utils/permissions";

export function convexWorkspaces({
  callbacks,
}: {
  callbacks?: {
    onWorkspaceRemoved?: OnWorkspaceRemovedCallback;
    onEntityRemoved?: OnEntityRemovedCallback;
  };
}) {
  const removeWorkspace = workspaces.functions.assembleRemoveWorkspace(
    callbacks?.onWorkspaceRemoved
  );
  const removeEntity = entities.functions.assembleRemoveEntity(
    callbacks?.onEntityRemoved
  );

  return {
    ...workspaces.functions,
    removeWorkspace,

    ...memberships.functions,

    ...entities.functions,
    removeEntity,

    ...entityAccess.functions,

    // Permissions
    checkUserPermission,
    checkEntityPermission,
    getUserRoleInWorkspace,
    getUserRoleForEntity,

    handlers: {
      ...workspaces.handlers,
      ...memberships.handlers,
      ...entities.handlers,
      ...entityAccess.handlers,
    },
  };
}
