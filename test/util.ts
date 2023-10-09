// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function copyId<K extends Record<string, any>>(from: K, to: K): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (to as any)._id = (from as any)._id;
}
