import {
  GenericDataModel,
  GenericQueryCtx,
  IdField,
  queryGeneric,
} from "convex/server";
import { v } from "convex/values";
import { getMembership } from "../../utils/queries/getMembership";
import { getEntityAccess } from "../../utils/queries/getEntityAccess";
import { requireAuth } from "../../utils/validation/requireAuth";

export async function checkEntityAccessHandler(
  ctx: GenericQueryCtx<GenericDataModel>,
  args: {
    entityId: IdField<"entities">["_id"];
    userId: IdField<"users">["_id"];
  }
) {
  const currentUserId = await requireAuth(ctx);

  const entity = await ctx.db.get(args.entityId);
  if (!entity) return false;

  // Проверяем, что текущий пользователь имеет доступ к entity
  // Либо через членство в оригинальном воркспейсе, либо через shared access
  const currentUserMembership = await getMembership(
    ctx,
    entity.workspaceId as IdField<"workspaces">["_id"],
    currentUserId
  );
  if (!currentUserMembership) {
    // Проверяем shared access
    const entityAccess = await getEntityAccess(ctx, args.entityId);
    let hasSharedAccess = false;

    for (const access of entityAccess) {
      const membership = await getMembership(
        ctx,
        access.workspaceId as IdField<"workspaces">["_id"],
        currentUserId
      );
      if (membership) {
        hasSharedAccess = true;
        break;
      }
    }

    if (!hasSharedAccess) {
      throw new Error("Access denied - you are not a member of this workspace");
    }
  }

  // Теперь безопасно проверяем доступ target пользователя
  const membership = await getMembership(
    ctx,
    entity.workspaceId as IdField<"workspaces">["_id"],
    args.userId
  );
  if (membership) return true;

  const entityAccess = await getEntityAccess(ctx, args.entityId);
  for (const access of entityAccess) {
    const userMembership = await getMembership(
      ctx,
      access.workspaceId as IdField<"workspaces">["_id"],
      args.userId
    );
    if (userMembership) return true;
  }

  return false;
}

export const checkEntityAccess = queryGeneric({
  args: {
    entityId: v.id("entities"),
    userId: v.id("users"),
  },
  handler: checkEntityAccessHandler,
});
