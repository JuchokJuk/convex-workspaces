import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import type {
  GenericMutationCtx,
  GenericDataModel,
  IdField,
} from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requirePermission } from "../../utils/validation/requirePermission";
import { requireWorkspace } from "../../utils/validation/requireWorkspace";
import { requireAuth } from "../../utils/validation/requireAuth";

export type OnWorkspaceRemovedCallback = (
  ctx: GenericMutationCtx<GenericDataModel>,
  args: { entityIds: IdField<"entities">["_id"][] }
) => Promise<void>;

export function assembleRemoveWorkspaceHandler(
  onWorkspaceRemoved?: OnWorkspaceRemovedCallback
) {
  return async (
    ctx: GenericMutationCtx<GenericDataModel>,
    args: { workspaceId: IdField<"workspaces">["_id"] }
  ) => {
    const userId = await requireAuth(ctx);

    const workspace = await ctx.db.get(args.workspaceId);
    requireWorkspace(workspace, args.workspaceId);

    const membership = await getMembership(ctx, args.workspaceId, userId);
    requirePermission(
      membership && membership.userRole === "admin",
      "removing workspace"
    );

    // Собираем все ID сущностей перед удалением
    const entities = await ctx.db
      .query("entities")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const entityIds = entities.map((entity) => entity._id as IdField<"entities">["_id"]);

    // Удаляем все связанные записи
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id as IdField<"memberships">["_id"]);
    }

    // Удаляем все сущности в воркспейсе
    for (const entity of entities) {
      await ctx.db.delete(entity._id as IdField<"entities">["_id"]);
    }

    // Удаляем все записи доступа к сущностям
    const entityAccess = await ctx.db
      .query("entityAccess")
      .withIndex("by_workspace_entity", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    for (const access of entityAccess) {
      await ctx.db.delete(access._id as IdField<"entityAccess">["_id"]);
    }

    // Удаляем сам воркспейс
    await ctx.db.delete(args.workspaceId);

    // Вызываем калбек с ID сущностей
    if (onWorkspaceRemoved) {
      await onWorkspaceRemoved(ctx, { entityIds });
    }
  };
}

export function assembleRemoveWorkspace(
  onWorkspaceRemoved?: OnWorkspaceRemovedCallback
) {
  return mutationGeneric({
    args: { workspaceId: v.id("workspaces") },
    handler: assembleRemoveWorkspaceHandler(onWorkspaceRemoved)
  });
}
