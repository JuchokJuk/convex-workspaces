import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireWorkspace } from "../../utils/validation/requireWorkspace";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function createWorkspaceHandler(
  ctx: GenericMutationCtx<GenericDataModel>,
  args: {
    name: string;
    personal: boolean;
  }
) {
  const userId = await requireAuth(ctx);

  // Если пытаемся создать персональный воркспейс, проверяем что его еще нет
  if (args.personal) {
    const existingPersonalWorkspace = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("userRole"), "admin"))
      .collect();

    // Проверяем, есть ли уже персональный воркспейс
    for (const membership of existingPersonalWorkspace) {
      const workspace = await ctx.db.get(membership.workspaceId as IdField<"workspaces">["_id"]);
      if (workspace?.personal) {
        throw new Error("User already has a personal workspace");
      }
    }
  }

  const workspaceId = await ctx.db.insert("workspaces", {
    name: args.name,
    personal: args.personal,
    ownerId: userId,
  });

  // Создаем membership для создателя воркспейса
  await ctx.db.insert("memberships", {
    workspaceId,
    userId,
    userRole: "admin",
  });

  return workspaceId;
}

export const createWorkspace = mutationGeneric({
  args: {
    name: v.string(),
    personal: v.boolean(),
  },
  handler: createWorkspaceHandler,
});
