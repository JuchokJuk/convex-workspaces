import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericQueryCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";

export async function getMembershipByWorkspaceAndUserHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: {
    workspaceId: IdField<"workspaces">["_id"];
    userId: IdField<"users">["_id"];
  }
) {
  return await getMembership(ctx, args.workspaceId, args.userId);
}

export const getMembershipByWorkspaceAndUser = queryGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: getMembershipByWorkspaceAndUserHandler,
});
