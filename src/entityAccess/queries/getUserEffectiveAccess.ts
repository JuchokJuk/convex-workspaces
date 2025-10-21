import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";
import { getEffectiveAccess } from "../../utils/permissions/getEffectiveAccess";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getUserEffectiveAccessHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: { entityId: IdField<"entities">["_id"] }
) {
  const userId = await requireAuth(ctx);
  return await getEffectiveAccess(ctx, args.entityId, userId);
}

export const getUserEffectiveAccess = queryGeneric({
  args: { entityId: v.id("entities") },
  returns: v.union(
    v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
    v.null()
  ),
  handler: getUserEffectiveAccessHandler,
});
