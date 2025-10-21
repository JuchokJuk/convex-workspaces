import {
  entitiesMutations,
  entitiesMutationshandlers,
  assembleRemoveEntity,
  type OnEntityRemovedCallback,
} from "./mutations";

import { entitiesQueries, entitiesQuerieshandlers } from "./queries";

import { entities as entitiesSchema } from "./schema";

export const entities = {
  functions: {
    ...entitiesMutations,
    ...entitiesQueries,
    assembleRemoveEntity,
  },
  handlers: {
    ...entitiesMutationshandlers,
    ...entitiesQuerieshandlers,
  },
  schema: entitiesSchema,
};

export type { OnEntityRemovedCallback };
