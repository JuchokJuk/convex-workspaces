import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import { getMembership } from "../utils/queries/getMembership";
import { requireAuth } from "../utils/validation/requireAuth";

export const getWorkspaceById = queryGeneric({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return null;

    const membership = await getMembership(ctx, args.workspaceId, userId);
    if (!membership) throw new Error("Access denied");

    return { ...workspace, userRole: membership.userRole };
  },
});

export const getWorkspacesByOwner = queryGeneric({
  args: {},
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    return await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
  },
});

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
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner_personal", (q) =>
        // @ts-expect-error double index typing missing
        q.eq("ownerId", userId).eq("personal", true)
      )
      .first();

    if (!workspace) return null;

    const membership = await getMembership(ctx, workspace._id, userId);
    if (!membership) return null;

    return { ...workspace, userRole: membership.userRole };
  },
});

export const getUserWorkspaces = queryGeneric({
  args: {},
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const workspaces = [];
    for (const membership of memberships) {
      const workspace = await ctx.db.get(membership.workspaceId);
      if (workspace) {
        workspaces.push({
          ...workspace,
          userRole: membership.userRole,
        });
      }
    }

    return workspaces;
  },
});
