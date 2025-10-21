import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type {
  GenericQueryCtx,
  GenericDataModel,
  IdField,
  Auth,
} from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function getPersonalWorkspaceHandler<T extends GenericDataModel>(
  ctx: GenericQueryCtx<T>,
  args: {}
) {
  const userId = await requireAuth(ctx as { auth: Auth });

  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_owner_personal", (q) =>
      // @ts-expect-error double index typing missing
      q.eq("ownerId", userId).eq("personal", true)
    )
    .first();

  if (!workspace) return null;

  const membership = await getMembership(
    ctx,
    workspace._id as IdField<"workspaces">["_id"],
    userId
  );
  if (!membership) return null;

  return { ...workspace, userRole: membership.userRole };
}

export const getPersonalWorkspace = queryGeneric({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("workspaces"),
      _creationTime: v.number(),
      name: v.string(),
      ownerId: v.string(),
      personal: v.boolean(),
      userRole: v.string(),
    }),
    v.null()
  ),
  handler: getPersonalWorkspaceHandler,
});
