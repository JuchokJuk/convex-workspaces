import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requireEntity } from "../../utils/validation/requireEntity";
import { requireWorkspace } from "../../utils/validation/requireWorkspace";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireNotExists } from "../../utils/validation/requireNotExists";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function createEntityAccessHandler(
  ctx: GenericMutationCtx<GenericDataModel>,
  args: {
    workspaceId: IdField<"workspaces">["_id"];
    entityId: IdField<"entities">["_id"];
    accessLevel: "admin" | "editor" | "viewer";
  }
) {
  const userId = await requireAuth(ctx);

  const entity = await ctx.db.get(args.entityId);
  requireEntity(entity, args.entityId);

  const membership = await getMembership(ctx, entity!.workspaceId as IdField<"workspaces">["_id"], userId);
  requirePermission(
    membership && membership.userRole !== "viewer",
    "sharing entities"
  );

  const targetWorkspace = await ctx.db.get(args.workspaceId);
  requireWorkspace(targetWorkspace, args.workspaceId);

  const existingAccess = await ctx.db
    .query("entityAccess")
    .withIndex("by_workspace_entity", (q) =>
      // @ts-expect-error double index typing missing
      q.eq("workspaceId", args.workspaceId).eq("entityId", args.entityId)
    )
    .first();

  requireNotExists(existingAccess, "Access");

  const accessId = await ctx.db.insert("entityAccess", {
    workspaceId: args.workspaceId,
    entityId: args.entityId,
    accessLevel: args.accessLevel,
  });

  return accessId;
}

export const createEntityAccess = mutationGeneric({
  args: {
    workspaceId: v.id("workspaces"),
    entityId: v.id("entities"),
    accessLevel: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: createEntityAccessHandler,
});
