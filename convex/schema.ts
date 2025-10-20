import { defineSchema } from "convex/server";
import { workspacesTables } from "../src/index";
import { documents } from "./documents/schema";
import { tasks } from "./tasks/schema";
import { users } from "./users/schema";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users,
  ...workspacesTables,
  documents,
  tasks,
});
