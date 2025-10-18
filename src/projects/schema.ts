import { defineTable } from "convex/server";
import { v } from "convex/values";

export const projectsSchema = {
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    ownerId: v.id("users"),
  }).index("by_workspace", ["workspaceId"]),
  
  workspaceProjects: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    accessLevel: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  }).index("by_workspace_project", ["workspaceId", "projectId"])
    .index("by_project_workspace", ["projectId", "workspaceId"]),
};
