import {
  entityAccessMutations,
  entityAccessMutationsHandlers,
} from "./mutations";

import {
  entityAccessQueries,
  entityAccessQueriesHandlers,
} from "./queries";

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
