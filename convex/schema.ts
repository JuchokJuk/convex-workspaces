import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { workspacesSchema } from "../src/index";

import { users } from "./users/schema";
import { documents } from "./documents/schema";
import { reports } from "./reports/schema";

export default defineSchema({
  ...authTables,
  users,

  // Воркспейсы и проекты из модуля
  ...workspacesSchema,

  // Моковые сущности
  documents,
  reports,
});
