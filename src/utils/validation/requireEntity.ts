export function requireEntity(entity: any, entityId: string): asserts entity is NonNullable<typeof entity> {
  if (!entity) {
    throw new Error(`Entity ${entityId} not found`);
  }
}
