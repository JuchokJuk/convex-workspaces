import { defineTable } from "convex/server";
import { v } from "convex/values";

export const documents = defineTable({
  name: v.string(),
  content: v.string(),
  projectId: v.id("projects"),
  authorId: v.id("users"),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_author", ["authorId"]);
