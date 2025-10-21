import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type {
  GenericMutationCtx,
  GenericDataModel,
  IdField,
} from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireEntity } from "../../utils/validation/requireEntity";
import { requireAuth } from "../../utils/validation/requireAuth";

export type OnEntityRemovedCallback = (
  ctx: GenericMutationCtx<GenericDataModel>,
  args: { entityId: IdField<"entities">["_id"] }
) => Promise<void>;

export function assembleRemoveEntityHandler(
  onEntityRemoved?: OnEntityRemovedCallback
) {
  return async (
    ctx: GenericMutationCtx<GenericDataModel>,
    args: { entityId: IdField<"entities">["_id"] }
  ) => {
    const userId = await requireAuth(ctx);

    const entity = await ctx.db.get(args.entityId);
    requireEntity(entity, args.entityId);

    const membership = await getMembership(
      ctx,
      entity!.workspaceId as IdField<"workspaces">["_id"],
      userId
    );
    requirePermission(
      membership && membership.userRole === "admin",
      "removing entities"
    );

    // Удаляем все записи доступа к сущности
    const entityAccess = await ctx.db
      .query("entityAccess")
      .withIndex("by_entity_workspace", (q) => q.eq("entityId", args.entityId))
      .collect();

    for (const access of entityAccess) {
      await ctx.db.delete(access._id as IdField<"entityAccess">["_id"]);
    }

    // Удаляем саму сущность
    await ctx.db.delete(args.entityId);

    // Вызываем калбек с ID сущности
    if (onEntityRemoved) {
      await onEntityRemoved(ctx, { entityId: args.entityId });
    }
  };
}

export function assembleRemoveEntity(
  onEntityRemoved?: OnEntityRemovedCallback
) {
  return mutationGeneric({
    args: { entityId: v.id("entities") },
    handler: assembleRemoveEntityHandler(onEntityRemoved)
  });
}
