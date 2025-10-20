import type { GenericQueryCtx, GenericDataModel } from "convex/server";
import { getMembership } from "../queries/getMembership";
import { hasRole } from "./hasRole";
import { UserRole } from "../types/roles";

export async function checkWorkspaceAccess(ctx: GenericQueryCtx<GenericDataModel>, workspaceId: string, userId: any, requiredRole: UserRole): Promise<boolean> {
  const membership = await getMembership(ctx, workspaceId, userId);
  if (!membership) return false;
  return hasRole(membership.userRole as UserRole, requiredRole);
}
