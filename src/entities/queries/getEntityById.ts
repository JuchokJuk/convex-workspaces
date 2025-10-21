import {
  GenericDataModel,
  GenericQueryCtx,
  IdField,
  queryGeneric,
} from "convex/server";
import { v } from "convex/values";
import { getMembership } from "../../utils/queries/getMembership";
import { getEntityAccess } from "../../utils/queries/getEntityAccess";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getEntityByIdHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: { entityId: IdField<"entities">["_id"] }
) {
  const userId = await requireAuth(ctx);

  const entity = await ctx.db.get(args.entityId);
  if (!entity) return null;

  const membership = await getMembership(
    ctx,
    entity.workspaceId as IdField<"workspaces">["_id"],
    userId
  );
  if (!membership) {
    const entityAccess = await getEntityAccess(ctx, args.entityId);
    const hasAccess = entityAccess.some((access) =>
      getMembership(
        ctx,
        access.workspaceId as IdField<"workspaces">["_id"],
        userId
      )
    );
    if (!hasAccess) throw new Error("Access denied");
  }

  return entity;
}

export const getEntityById = queryGeneric({
  args: { entityId: v.id("entities") },
  handler: getEntityByIdHandler,
});
