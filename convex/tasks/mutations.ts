import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../utils/requireAuth";
import { Id } from "../_generated/dataModel";
import { workspaces } from "../workspaces";
import { checkEntityAccess } from "../utils/accessControl";

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Проверяем доступ к entity через convex-workspaces
    await checkEntityAccess(ctx, task.entityId);

    const { taskId, ...updates } = args;
    await ctx.db.patch(taskId, updates);
  },
});

export const removeTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Проверяем доступ к entity через convex-workspaces
    await checkEntityAccess(ctx, task.entityId);

    await ctx.db.delete(args.taskId);
  },
});

export const createTask = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Создаем entity в воркспейсе
    const entityId = (await workspaces.createEntityHandler(ctx, {
      workspaceId: args.workspaceId,
    })) as Id<"entities">;

    // Создаем задачу
    const taskId = await ctx.db.insert("tasks", {
      entityId,
      title: args.title,
    });

    return { entityId, taskId };
  },
});

export const createTaskForEntity = mutation({
  args: {
    entityId: v.id("entities"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Проверяем доступ к entity через convex-workspaces
    await checkEntityAccess(ctx, args.entityId);

    // Создаем задачу
    const taskId = await ctx.db.insert("tasks", {
      entityId: args.entityId,
      title: args.title,
    });

    return taskId;
  },
});
