import { GenericId } from "convex/values";

/**
 * Ensures that a user has a personal workspace.
 * Throws an error if the personal workspace is not found.
 *
 * @param ctx - Convex context (QueryCtx or MutationCtx)
 * @param userId - The ID of the user to check
 * @returns The personal workspace object
 * @throws Error if personal workspace is not found
 */
export async function requirePersonalWorkspace(
  ctx: any,
  userId: GenericId<"users">
) {
  const personalWorkspace = await ctx.db
    .query("workspaces")
    .withIndex("by_owner_personal", (q: any) =>
      q.eq("ownerId", userId).eq("personal", true)
    )
    .first();

  if (!personalWorkspace) {
    throw new Error(
      "Personal workspace not found. Every user must have a personal workspace. " +
        "Ensure that you call initializePersonalWorkspace() in your afterUserCreatedOrUpdated " +
        "callback to create the required personal workspace."
    );
  }

  return personalWorkspace;
}
