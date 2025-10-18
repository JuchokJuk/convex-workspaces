import { mutation, v } from "../convex-stubs";
import { requireAuth } from "../utils/authUtils";

export const createWorkspace = mutation({
  args: {
    name: v.string(),
    personal: v.boolean(),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await requireAuth(ctx);

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      personal: args.personal,
      ownerId: userId,
    });

    // Добавляем создателя как admin в новый воркспейс
    await ctx.db.insert("workspaceUsers", {
      workspaceId,
      userId: userId,
      userRole: "admin",
    });

    return workspaceId;
  },
});

export const addUserToWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    targetUserId: v.id("users"),
    userRole: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx: any, args: any) => {
    const currentUserId = await requireAuth(ctx);

    // Проверяем, что текущий пользователь является владельцем воркспейса
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    if (workspace.ownerId !== currentUserId) {
      throw new Error("Only workspace owner can add users");
    }

    // Проверяем, не добавлен ли уже пользователь
    const existing = await ctx.db
      .query("workspaceUsers")
      .withIndex("by_workspace_user", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", args.targetUserId)
      )
      .first();

    if (existing) {
      throw new Error("User is already a member of this workspace");
    }

    await ctx.db.insert("workspaceUsers", {
      workspaceId: args.workspaceId,
      userId: args.targetUserId,
      userRole: args.userRole,
    });

    return { success: true };
  },
});

export function assembleDeleteWorkspace(onWorkspaceDelete?: (ctx: any, workspaceId: any) => Promise<void>) {
  return mutation({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx: any, args: any) => {
      const userId = await requireAuth(ctx);

      const workspace = await ctx.db.get(args.workspaceId);
      if (!workspace || workspace.ownerId !== userId) {
        throw new Error("Only workspace owner can delete workspace");
      }

      // Удаляем все проекты в воркспейсе
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
        .collect();

      for (const project of projects) {
        await ctx.db.delete(project._id);
      }

      // Удаляем связи пользователей с воркспейсом
      const workspaceUsers = await ctx.db
        .query("workspaceUsers")
        .withIndex("by_workspace_user", (q: any) => q.eq("workspaceId", args.workspaceId))
        .collect();

      await Promise.all(workspaceUsers.map((wu: any) => ctx.db.delete(wu._id)));

      // Удаляем связи проекта с воркспейсами
      const workspaceProjects = await ctx.db
        .query("workspaceProjects")
        .withIndex("by_workspace_project", (q: any) => q.eq("workspaceId", args.workspaceId))
        .collect();

      await Promise.all(workspaceProjects.map((wp: any) => ctx.db.delete(wp._id)));

      // Вызываем кастомный колбек
      await onWorkspaceDelete?.(ctx, args.workspaceId);

      // Удаляем сам воркспейс
      await ctx.db.delete(args.workspaceId);
      return { success: true };
    },
  });
}
