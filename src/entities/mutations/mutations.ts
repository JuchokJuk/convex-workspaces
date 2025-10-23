import { createEntityHandler, createEntity } from "./createEntity";
import {
  assembleRemoveEntityHandler,
  assembleRemoveEntity,
} from "./removeEntity";

export const entitiesMutations = {
  createEntity,
};

export const entitiesMutationshandlers = {
  createEntityHandler,
  assembleRemoveEntityHandler,
};

export { assembleRemoveEntity };
export type { OnEntityRemovedCallback } from "./removeEntity";
