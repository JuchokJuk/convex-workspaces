import {
  GenericDataModel,
  GenericQueryCtx,
  IdField,
  queryGeneric,
} from "convex/server";
import { getMembership } from "../../utils/queries/getMembership";
import { requireAuth } from "../../utils/validation/requireAuth";
import { UserRole } from "../../types";

export async function getUserAccessibleEntitiesHandler<T extends GenericDataModel>(
  ctx: GenericQueryCtx<T>
) {
  const userId = await requireAuth(ctx);

  const memberships = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", userId as any))
    .collect();

  const accessibleEntities: {
    _id: IdField<"entities">["_id"];
    _creationTime: number;
    workspaceId: IdField<"workspaces">["_id"];
    userRole: UserRole;
  }[] = [];

  for (const membership of memberships) {
    const entities = await ctx.db
      .query("entities")
      .withIndex("by_workspace", (q) =>
        q.eq(
          "workspaceId",
          membership.workspaceId as any
        )
      )
      .collect();

    for (const entity of entities) {
      accessibleEntities.push({
        _id: entity._id as IdField<"entities">["_id"],
        _creationTime: entity._creationTime as number,
        userRole: membership.userRole as UserRole,
        workspaceId: membership.workspaceId as IdField<"workspaces">["_id"],
      });
    }
  }

  const allEntityAccess = await ctx.db.query("entityAccess").collect();

  for (const access of allEntityAccess) {
    const userMembership = await getMembership(
      ctx,
      access.workspaceId as IdField<"workspaces">["_id"],
      userId
    );
    if (userMembership) {
      const entity = await ctx.db.get(
        access.entityId as IdField<"entities">["_id"]
      );
      if (entity && !accessibleEntities.find((e) => e._id === entity._id)) {
        accessibleEntities.push({
          _id: entity._id as IdField<"entities">["_id"],
          _creationTime: entity._creationTime as number,
          userRole: access.accessLevel as UserRole,
          workspaceId: access.workspaceId as IdField<"workspaces">["_id"],
        });
      }
    }
  }

  return accessibleEntities;
}

export const getUserAccessibleEntities = queryGeneric({
  args: {},
  handler: getUserAccessibleEntitiesHandler,
});
