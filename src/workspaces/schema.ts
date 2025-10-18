import { defineTable } from "convex/server";
import { v } from "convex/values";

export const workspacesSchema = {
  workspaces: defineTable({
    name: v.string(),
    personal: v.boolean(),
    ownerId: v.id("users"),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_personal", ["ownerId", "personal"]),
  
  workspaceUsers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    userRole: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  })
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_user", ["userId"]),
};
