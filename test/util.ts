import mongoose from "mongoose";

export async function clearDatabase() {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function copyId<K extends Record<string, any>>(from: K, to: K): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  copyProp("_id", from, to);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function copyProp<K extends Record<string, any>>(
  prop: string,
  from: K,
  to: K,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (to as any)[prop] = (from as any)[prop];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addProp(
  prop: string,
  value: unknown,
  to: Record<string, any>,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (to as any)[prop] = value;
}