export function requireNotExists(existing: any, resource: string): asserts existing is null {
  if (existing) {
    throw new Error(`${resource} already exists`);
  }
}
