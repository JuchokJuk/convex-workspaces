import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel } from "convex/server";
import { getMembership } from "../utils/queries/getMembership";
import { requirePermission } from "../utils/validation/requirePermission";
import { requireEntity } from "../utils/validation/requireEntity";
import { requireAuth } from "../utils/validation/requireAuth";

export const createEntity = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const membership = await getMembership(ctx, args.workspaceId, userId);
    requirePermission(
      membership && membership.userRole !== "viewer",
      "creating entities"
    );

    const entityId = await ctx.db.insert("entities", {
      workspaceId: args.workspaceId,
    });

    return entityId;
  },
});

export function assembleRemoveEntity(
  onEntityRemoved?: (
    ctx: GenericMutationCtx<GenericDataModel>,
    args: { entityId: string }
  ) => Promise<void>
) {
  return mutationGeneric({
    args: { entityId: v.id("entities") },
    handler: async (ctx, args) => {
      const userId = await requireAuth(ctx);

      const entity = await ctx.db.get(args.entityId);
      requireEntity(entity, args.entityId);

      const membership = await getMembership(ctx, entity.workspaceId, userId);
      requirePermission(
        membership && membership.userRole !== "viewer",
        "removing entities"
      );

      // Удаляем все записи доступа к сущности
      const entityAccess = await ctx.db
        .query("entityAccess")
        .withIndex("by_entity_workspace", (q) =>
          q.eq("entityId", args.entityId)
        )
        .collect();

      for (const access of entityAccess) {
        await ctx.db.delete(access._id);
      }

      // Удаляем саму сущность
      await ctx.db.delete(args.entityId);

      // Вызываем калбек с ID сущности
      if (onEntityRemoved) {
        await onEntityRemoved(ctx, { entityId: args.entityId });
      }
    },
  });
}
