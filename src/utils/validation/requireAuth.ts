import { getAuthUserId } from "@convex-dev/auth/server";
import type { IdField, Auth } from "convex/server";

export async function requireAuth(ctx: {
  auth: Auth;
}): Promise<IdField<"users">["_id"]> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}
