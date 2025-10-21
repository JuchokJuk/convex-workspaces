import { getMembershipByWorkspaceAndUserHandler, getMembershipByWorkspaceAndUser } from "./getMembershipByWorkspaceAndUser";
import { getMembershipsByWorkspaceHandler, getMembershipsByWorkspace } from "./getMembershipsByWorkspace";
import { getMembershipsByUserHandler, getMembershipsByUser } from "./getMembershipsByUser";
import { getCurrentUserMembershipHandler, getCurrentUserMembership } from "./getCurrentUserMembership";

export const membershipsQueriesHandlers = {
  getMembershipByWorkspaceAndUserHandler,
  getMembershipsByWorkspaceHandler,
  getMembershipsByUserHandler,
  getCurrentUserMembershipHandler,
};

export const membershipsQueries = {
  getMembershipByWorkspaceAndUser,
  getMembershipsByWorkspace,
  getMembershipsByUser,
  getCurrentUserMembership,
};
