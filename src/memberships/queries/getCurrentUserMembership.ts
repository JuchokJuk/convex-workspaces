import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getCurrentUserMembershipHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: { workspaceId: IdField<"workspaces">["_id"] }
) {
  const userId = await requireAuth(ctx);

  return await getMembership(ctx, args.workspaceId, userId);
}

export const getCurrentUserMembership = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: getCurrentUserMembershipHandler,
});
