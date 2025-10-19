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
import type * as reports_mutations from "../reports/mutations.js";
import type * as reports_queries from "../reports/queries.js";
import type * as setDefaultUserData from "../setDefaultUserData.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";
import type * as utils_accessControl from "../utils/accessControl.js";
import type * as utils_authUtils from "../utils/authUtils.js";
import type * as utils_cascadeDeletion from "../utils/cascadeDeletion.js";
import type * as utils_roles from "../utils/roles.js";
import type * as utils_testHelpers from "../utils/testHelpers.js";
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
  "reports/mutations": typeof reports_mutations;
  "reports/queries": typeof reports_queries;
  setDefaultUserData: typeof setDefaultUserData;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
  "utils/accessControl": typeof utils_accessControl;
  "utils/authUtils": typeof utils_authUtils;
  "utils/cascadeDeletion": typeof utils_cascadeDeletion;
  "utils/roles": typeof utils_roles;
  "utils/testHelpers": typeof utils_testHelpers;
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
