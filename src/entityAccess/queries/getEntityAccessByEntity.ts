import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";

export async function getEntityAccessByEntityHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: { entityId: IdField<"entities">["_id"] }
) {
  return await ctx.db
    .query("entityAccess")
    .withIndex("by_entity_workspace", (q) => q.eq("entityId", args.entityId))
    .collect();
}

export const getEntityAccessByEntity = queryGeneric({
  args: { entityId: v.id("entities") },
  handler: getEntityAccessByEntityHandler,
});
