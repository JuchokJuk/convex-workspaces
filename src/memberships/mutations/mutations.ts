import { createMembershipHandler, createMembership } from "./createMembership";
import { updateMembershipRoleHandler, updateMembershipRole } from "./updateMembershipRole";
import { removeMembershipHandler, removeMembership } from "./removeMembership";
import { removeUserFromWorkspaceHandler, removeUserFromWorkspace } from "./removeUserFromWorkspace";

export const membershipsMutations = {
  createMembership,
  updateMembershipRole,
  removeMembership,
  removeUserFromWorkspace,
};

export const membershipsMutationsHandlers = {
  createMembershipHandler,
  updateMembershipRoleHandler,
  removeMembershipHandler,
  removeUserFromWorkspaceHandler,
};
