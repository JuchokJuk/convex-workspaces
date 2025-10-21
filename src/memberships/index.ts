import {
  membershipsMutations,
  membershipsMutationsHandlers,
} from "./mutations";

import {
  membershipsQueries,
  membershipsQueriesHandlers,
} from "./queries";

import { memberships as membershipsSchema } from "./schema";

export const memberships = {
  functions: {
    ...membershipsMutations,
    ...membershipsQueries,
  },
  handlers: {
    ...membershipsMutationsHandlers,
    ...membershipsQueriesHandlers,
  },
  schema: membershipsSchema,
};
