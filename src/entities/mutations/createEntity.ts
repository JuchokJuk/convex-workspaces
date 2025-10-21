import {
  GenericDataModel,
  GenericMutationCtx,
  IdField,
  mutationGeneric,
} from "convex/server";
import { v } from "convex/values";
import { getMembership } from "../../utils/queries/getMembership";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function createEntityHandler(
  ctx: GenericMutationCtx<GenericDataModel>,
  args: { workspaceId: IdField<"workspaces">["_id"] }
) {
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
}

export const createEntity = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: createEntityHandler,
});
