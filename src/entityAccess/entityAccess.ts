import {
  entityAccessMutations,
  entityAccessMutationsHandlers,
} from "./mutations/mutations";

import {
  entityAccessQueries,
  entityAccessQueriesHandlers,
} from "./queries/queries";

import { entityAccess as entityAccessSchema } from "./schema";

export const entityAccess = {
  functions: {
    ...entityAccessMutations,
    ...entityAccessQueries,
  },
  handlers: {
    ...entityAccessMutationsHandlers,
    ...entityAccessQueriesHandlers,
  },
  schema: entityAccessSchema,
};
