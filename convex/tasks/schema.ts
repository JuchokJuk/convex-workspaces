import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tasks = defineTable({
  entityId: v.id("entities"), // связь с entity вместо workspaceId
  title: v.string(),
  description: v.optional(v.string()),
  completed: v.boolean(),
})
  .index("by_entity", ["entityId"]);
