import { createEntityAccessHandler, createEntityAccess } from "./createEntityAccess";
import { updateEntityAccessLevelHandler, updateEntityAccessLevel } from "./updateEntityAccessLevel";
import { removeEntityAccessHandler, removeEntityAccess } from "./removeEntityAccess";

export const entityAccessMutations = {
  createEntityAccess,
  updateEntityAccessLevel,
  removeEntityAccess,
};

export const entityAccessMutationsHandlers = {
  createEntityAccessHandler,
  updateEntityAccessLevelHandler,
  removeEntityAccessHandler,
};
