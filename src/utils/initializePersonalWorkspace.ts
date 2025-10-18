/**
 * Initializes a personal workspace for a user.
 * This function should be called during user registration or in the auth callback
 * to ensure every user has a personal workspace.
 * 
 * @param ctx - Convex context (QueryCtx or MutationCtx)
 * @param userId - The ID of the user to create a personal workspace for
 * @param workspaceName - Optional custom name for the personal workspace (defaults to "My Workspace")
 * @returns The ID of the created personal workspace
 */
export async function initializePersonalWorkspace(
  ctx: any,
  userId: any,
  workspaceName: string = "My Workspace"
) {
  // Check if user already has a personal workspace
  const existingPersonalWorkspace = await ctx.db
    .query("workspaces")
    .withIndex("by_owner_personal", (q: any) => 
      q.eq("ownerId", userId).eq("personal", true)
    )
    .first();

  if (existingPersonalWorkspace) {
    return existingPersonalWorkspace._id;
  }

  // Create personal workspace
  const personalWorkspaceId = await ctx.db.insert("workspaces", {
    name: workspaceName,
    personal: true,
    ownerId: userId,
  });

  // Add user to personal workspace with admin role
  await ctx.db.insert("workspaceUsers", {
    workspaceId: personalWorkspaceId,
    userId: userId,
    userRole: "admin",
  });

  return personalWorkspaceId;
}

