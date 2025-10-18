import { getAuthUserId } from "../convex-stubs";

/**
 * Gets the current authenticated user ID from the Convex context.
 * Throws an error if no user is authenticated.
 * 
 * @param ctx - Convex context (QueryCtx or MutationCtx)
 * @returns The authenticated user ID
 * @throws {Error} If no user is authenticated
 */
export async function requireAuth(ctx: any): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User must be authenticated to perform this action");
  }
  return userId;
}
