export function requirePermission(hasPermission: boolean | null, action: string): asserts hasPermission is true {
  if (!hasPermission) {
    throw new Error(`Insufficient permissions for ${action}`);
  }
}
