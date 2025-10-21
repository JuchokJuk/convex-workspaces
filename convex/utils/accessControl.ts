import { Doc, Id } from "../_generated/dataModel";
import { workspaces } from "../workspaces";
import { MutationCtx, QueryCtx } from "../_generated/server";

export interface EntityAccessResult {
  entity: Doc<"entities">;
  membership: Doc<"memberships"> | null;
  effectiveAccess: string | null;
}

/**
 * Проверяет доступ к entity через workspace membership или shared access
 */
export async function checkEntityAccess(
  ctx: QueryCtx | MutationCtx,
  entityId: Id<"entities">
): Promise<EntityAccessResult> {
  const entity = (await ctx.db.get(entityId)) as Doc<"entities">;
  if (!entity) throw new Error("Entity not found");

  const membership = (await workspaces.getCurrentUserMembershipHandler(ctx, {
    workspaceId: entity.workspaceId as Id<"workspaces">,
  })) as Doc<"memberships"> | null;

  let effectiveAccess: string | null = null;
  if (!membership) {
    // Проверяем доступ через shared entity
    effectiveAccess = await workspaces.getUserEffectiveAccessHandler(ctx, {
      entityId,
    });
    if (!effectiveAccess) throw new Error("Access denied");
  }

  return { entity, membership, effectiveAccess };
}


/**
 * Проверяет права на запись (не viewer)
 */
export function checkWritePermission(
  membership: Doc<"memberships"> | null
): void {
  if (membership?.userRole === "viewer") {
    throw new Error("Insufficient permissions");
  }
}
