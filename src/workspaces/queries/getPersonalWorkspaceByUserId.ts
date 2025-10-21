import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import type {
  GenericQueryCtx,
  GenericDataModel,
  IdField,
} from "convex/server";

export async function getPersonalWorkspaceByUserIdHandler<T extends GenericDataModel>(
  ctx: GenericQueryCtx<T>,
  args: { userId: string }
) {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_owner_personal", (q) =>
      // @ts-expect-error double index typing missing
      q.eq("ownerId", args.userId).eq("personal", true)
    )
    .first();

  if (!workspace) return null;

  return { ...workspace, userRole: "admin" }; // Владелец всегда admin
}

export const getPersonalWorkspaceByUserId = queryGeneric({
  args: { userId: v.string() },
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
  handler: getPersonalWorkspaceByUserIdHandler,
});
