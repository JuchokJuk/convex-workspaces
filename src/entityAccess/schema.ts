import { defineTable } from "convex/server";
import { v } from "convex/values";

export const entityAccess = defineTable({
  workspaceId: v.id("workspaces"),
  entityId: v.id("entities"),
  accessLevel: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
})
  .index("by_workspace_entity", ["workspaceId", "entityId"])
  .index("by_entity_workspace", ["entityId", "workspaceId"]);
