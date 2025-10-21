import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";

export async function getEntityAccess<T extends GenericDataModel>(ctx: GenericQueryCtx<T>, entityId: IdField<"entities">["_id"]) {
  return await ctx.db
    .query("entityAccess")
    .withIndex("by_entity_workspace", (q) => q.eq("entityId", entityId as any))
    .collect();
}
