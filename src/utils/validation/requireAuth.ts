import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericQueryCtx, GenericMutationCtx, GenericActionCtx, GenericDataModel, IdField } from "convex/server";

export async function requireAuth(
  ctx: GenericQueryCtx<GenericDataModel> | GenericMutationCtx<GenericDataModel> | GenericActionCtx<GenericDataModel>
): Promise<IdField<"users">["_id"]> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}
