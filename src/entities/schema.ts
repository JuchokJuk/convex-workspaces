import { defineTable } from "convex/server";
import { v } from "convex/values";

export const entities = defineTable({
  workspaceId: v.id("workspaces"),
}).index("by_workspace", ["workspaceId"]);
