import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type { GenericMutationCtx, GenericDataModel, IdField } from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requireEntity } from "../../utils/validation/requireEntity";
import { requireWorkspace } from "../../utils/validation/requireWorkspace";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireNotExists } from "../../utils/validation/requireNotExists";
import { requireAuth } from "../../utils/validation/requireAuth";
import { getMinRole } from "../../utils/permissions/getMinRole";
import { UserRole } from "../../utils/types/roles";

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

  // Проверяем права на исходный воркспейс (где находится entity)
  const sourceMembership = await getMembership(ctx, entity!.workspaceId as IdField<"workspaces">["_id"], userId);
  requirePermission(
    sourceMembership && sourceMembership.userRole !== "viewer",
    "sharing entities"
  );

  const targetWorkspace = await ctx.db.get(args.workspaceId);
  requireWorkspace(targetWorkspace, args.workspaceId);

  // Для персональных воркспейсов - шеринг доступен всем
  // Для командных воркспейсов - проверяем права
  let limitedAccessLevel: UserRole;
  
  if (targetWorkspace!.personal) {
    // Персональные воркспейсы: ограничиваем только правами пользователя в исходном воркспейсе
    const sourceRole = sourceMembership!.userRole as UserRole;
    limitedAccessLevel = getMinRole(args.accessLevel as UserRole, sourceRole);
  } else {
    // Командные воркспейсы: проверяем права на целевой воркспейс
    const targetMembership = await getMembership(ctx, args.workspaceId, userId);
    requirePermission(
      targetMembership as any,
      "sharing entities to this workspace"
    );

    // Ограничиваем accessLevel до минимального из прав пользователя в обоих воркспейсах
    const sourceRole = sourceMembership!.userRole as UserRole;
    const targetRole = targetMembership!.userRole as UserRole;
    const minRole = getMinRole(sourceRole, targetRole);
    
    // Ограничиваем запрашиваемый accessLevel до минимального уровня пользователя
    limitedAccessLevel = getMinRole(args.accessLevel as UserRole, minRole);
  }

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
    accessLevel: limitedAccessLevel,
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
