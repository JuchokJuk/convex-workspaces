import type { GenericDataModel, GenericMutationCtx } from "convex/server";
import type { GenericId } from "convex/values";

export async function initializePersonalWorkspace(
  ctx: GenericMutationCtx<GenericDataModel>,
  userId: GenericId<"users">,
  name: string
): Promise<GenericId<"workspaces">> {
  // Create personal workspace
  const personalWorkspaceId = await ctx.db.insert("workspaces", {
    name: name,
    personal: true,
    ownerId: userId,
  });

  // Add user to personal workspace with admin role
  await ctx.db.insert("memberships", {
    workspaceId: personalWorkspaceId,
    userId: userId,
    userRole: "admin",
  });

  return personalWorkspaceId;
}
