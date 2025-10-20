import type { GenericQueryCtx, GenericDataModel } from "convex/server";

export async function getEntityAccess(ctx: GenericQueryCtx<GenericDataModel>, entityId: string) {
  return await ctx.db
    .query("entityAccess")
    .withIndex("by_entity_workspace", (q) => q.eq("entityId", entityId))
    .collect();
}
