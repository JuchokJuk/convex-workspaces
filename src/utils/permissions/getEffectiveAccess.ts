import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../queries/getMembership";
import { getEntityAccess } from "../queries/getEntityAccess";
import { getMinRole } from "./getMinRole";
import { UserRole } from "../types/roles";

export async function getEffectiveAccess(
  ctx: GenericQueryCtx<GenericDataModel>,
  entityId: IdField<"entities">["_id"],
  userId: IdField<"users">["_id"]
): Promise<UserRole | null> {
  const entity = await ctx.db.get(entityId);
  if (!entity) return null;

  const mainMembership = await getMembership(
    ctx,
    entity.workspaceId as IdField<"workspaces">["_id"],
    userId
  );
  const mainRole = mainMembership?.userRole as UserRole | undefined;

  const entityAccess = await getEntityAccess(ctx, entityId);
  let sharedRole: UserRole | null = null;

  for (const access of entityAccess) {
    const userMembership = await getMembership(
      ctx,
      access.workspaceId as IdField<"workspaces">["_id"],
      userId
    );
    if (userMembership) {
      sharedRole = access.accessLevel as UserRole;
      break;
    }
  }

  if (!mainRole && !sharedRole) return null;
  if (!mainRole) return sharedRole;
  if (!sharedRole) return mainRole;

  return getMinRole(mainRole, sharedRole);
}
