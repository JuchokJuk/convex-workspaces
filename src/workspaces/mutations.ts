import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../utils/queries/getMembership";
import { requirePermission } from "../utils/validation/requirePermission";
import { requireWorkspace } from "../utils/validation/requireWorkspace";
import { requireAuth } from "../utils/validation/requireAuth";

export const createWorkspace = mutationGeneric({
  args: {
    name: v.string(),
    personal: v.boolean(),
  },
  handler: async (ctx, args) => {
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
        const workspace = await ctx.db.get(membership.workspaceId);
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
  },
});

export const updateWorkspace = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const workspace = await ctx.db.get(args.workspaceId);
    requireWorkspace(workspace, args.workspaceId);

    const membership = await getMembership(ctx, args.workspaceId, userId);
    requirePermission(
      membership && membership.userRole === "admin",
      "updating workspace"
    );

    const { workspaceId, ...updates } = args;
    await ctx.db.patch(workspaceId, updates);
  },
});

export function assembleRemoveWorkspace<T extends GenericDataModel>(
  onWorkspaceRemoved?: (
    ctx: GenericMutationCtx<T>,
    args: { entityIds: IdField<"entities">["_id"][] }
  ) => Promise<void>
) {
  return mutationGeneric({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
      const userId = await requireAuth(ctx);

      const workspace = await ctx.db.get(args.workspaceId);
      requireWorkspace(workspace, args.workspaceId);

      const membership = await getMembership(ctx, args.workspaceId, userId);
      requirePermission(
        membership && membership.userRole === "admin",
        "removing workspace"
      );

      // Собираем все ID сущностей перед удалением
      const entities = await ctx.db
        .query("entities")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();

      const entityIds = entities.map((entity) => entity._id);

      // Удаляем все связанные записи
      const memberships = await ctx.db
        .query("memberships")
        .withIndex("by_workspace_user", (q) =>
          q.eq("workspaceId", args.workspaceId)
        )
        .collect();

      for (const membership of memberships) {
        await ctx.db.delete(membership._id);
      }

      // Удаляем все сущности в воркспейсе
      for (const entity of entities) {
        await ctx.db.delete(entity._id);
      }

      // Удаляем все записи доступа к сущностям
      const entityAccess = await ctx.db
        .query("entityAccess")
        .withIndex("by_workspace_entity", (q) =>
          q.eq("workspaceId", args.workspaceId)
        )
        .collect();

      for (const access of entityAccess) {
        await ctx.db.delete(access._id);
      }

      // Удаляем сам воркспейс
      await ctx.db.delete(args.workspaceId);

      // Вызываем калбек с ID сущностей
      if (onWorkspaceRemoved) {
        await onWorkspaceRemoved(ctx, { entityIds });
      }
    },
  });
}
