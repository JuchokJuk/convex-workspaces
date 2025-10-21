import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requireEntity } from "../../utils/validation/requireEntity";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function updateEntityAccessLevelHandler(
  ctx: GenericMutationCtx<GenericDataModel>,
  args: {
    accessId: IdField<"entityAccess">["_id"];
    accessLevel: "admin" | "editor" | "viewer";
  }
) {
  const userId = await requireAuth(ctx);

  const access = await ctx.db.get(args.accessId);
  if (!access) throw new Error("Access not found");

  const entity = await ctx.db.get(access.entityId as IdField<"entities">["_id"]);
  requireEntity(entity, access.entityId as IdField<"entities">["_id"]);

  const membership = await getMembership(ctx, entity!.workspaceId as IdField<"workspaces">["_id"], userId);
  requirePermission(
    membership && membership.userRole !== "viewer",
    "updating entity access"
  );

  await ctx.db.patch(args.accessId, {
    accessLevel: args.accessLevel,
  });
}

export const updateEntityAccessLevel = mutationGeneric({
  args: {
    accessId: v.id("entityAccess"),
    accessLevel: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
  },
  handler: updateEntityAccessLevelHandler,
});
