import { defineTable } from "convex/server";
import { v } from "convex/values";

export const reports = defineTable({
  name: v.string(),
  data: v.any(),
  projectId: v.id("projects"),
  authorId: v.id("users"),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_author", ["authorId"]);

