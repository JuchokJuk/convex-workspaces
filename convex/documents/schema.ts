import { defineTable } from "convex/server";
import { v } from "convex/values";

export const documents = defineTable({
  entityId: v.id("entities"),
  title: v.string(),
})
  .index("by_entity", ["entityId"]);