import { defineTable } from "convex/server";
import { v } from "convex/values";

export const workspaces = defineTable({
  name: v.string(),
  personal: v.boolean(),
  ownerId: v.id("users"),
})
  .index("by_owner", ["ownerId"])
  .index("by_owner_personal", ["ownerId", "personal"]);
