import type { GenericQueryCtx, GenericDataModel } from "convex/server";
import { getMembership } from "../queries/getMembership";
import { getEntityAccess } from "../queries/getEntityAccess";
import { getMinRole } from "./getMinRole";
import { UserRole } from "../types/roles";

export async function getEffectiveAccess(ctx: GenericQueryCtx<GenericDataModel>, entityId: any, userId: any): Promise<UserRole | null> {
  const entity = await ctx.db.get(entityId);
  if (!entity) return null;

  const mainMembership = await getMembership(ctx, entity.workspaceId as any, userId);
  const mainRole = mainMembership?.userRole as UserRole | undefined;

  const entityAccess = await getEntityAccess(ctx, entityId);
  let sharedRole: UserRole | null = null;

  for (const access of entityAccess) {
    const userMembership = await getMembership(ctx, access.workspaceId as any, userId);
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
