import { defineTable } from "convex/server";
import { v } from "convex/values";

export const memberships = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
  userRole: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
})
  .index("by_workspace_user", ["workspaceId", "userId"])
  .index("by_user", ["userId"]);
