/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as documents_mutations from "../documents/mutations.js";
import type * as documents_queries from "../documents/queries.js";
import type * as http from "../http.js";
import type * as setDefaultUserData from "../setDefaultUserData.js";
import type * as tasks_mutations from "../tasks/mutations.js";
import type * as tasks_queries from "../tasks/queries.js";
import type * as users_queries from "../users/queries.js";
import type * as utils_accessControl from "../utils/accessControl.js";
import type * as utils_index from "../utils/index.js";
import type * as utils_requireAuth from "../utils/requireAuth.js";
import type * as utils_test from "../utils/test.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "documents/mutations": typeof documents_mutations;
  "documents/queries": typeof documents_queries;
  http: typeof http;
  setDefaultUserData: typeof setDefaultUserData;
  "tasks/mutations": typeof tasks_mutations;
  "tasks/queries": typeof tasks_queries;
  "users/queries": typeof users_queries;
  "utils/accessControl": typeof utils_accessControl;
  "utils/index": typeof utils_index;
  "utils/requireAuth": typeof utils_requireAuth;
  "utils/test": typeof utils_test;
  workspaces: typeof workspaces;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
