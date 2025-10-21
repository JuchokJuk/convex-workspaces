import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { requireAuth } from "../utils/requireAuth";
import { Id } from "../_generated/dataModel";

export const createTaskWithEntity = action({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Создаем entity в воркспейсе
    const entityId = (await ctx.runMutation(api.workspaces.createEntity, {
      workspaceId: args.workspaceId,
    })) as Id<"entities">;

    // Создаем задачу
    const taskId = (await ctx.runMutation(api.tasks.mutations.createTask, {
      entityId,
      title: args.title,
    })) as Id<"tasks">;

    return { entityId, taskId };
  },
});
