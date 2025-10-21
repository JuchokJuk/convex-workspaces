import {
  workspacesMutations,
  workspacesMutationsHandlers,
  assembleRemoveWorkspace,
  type OnWorkspaceRemovedCallback,
} from "./mutations";

import {
  workspacesQueries,
  workspacesQueriesHandlers,
} from "./queries";

import { workspaces as workspacesSchema } from "./schema";

export const workspaces = {
  functions: {
    ...workspacesMutations,
    ...workspacesQueries,
    assembleRemoveWorkspace,
  },
  handlers: {
    ...workspacesMutationsHandlers,
    ...workspacesQueriesHandlers,
  },
  schema: workspacesSchema,
};

export type { OnWorkspaceRemovedCallback };
