import mongoose from "mongoose";

//FIXME takes too long, find why
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
export function addProp<K extends Record<string, any>>(
  prop: string,
  value: unknown,
  to: K,
): K {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (to as any)[prop] = value;
  return to;
}

/**
 * Adds a __v mongoose version field with a value of 0 to be able to use jest functions like toContainEqual() and toEqual()
 * @param to the object to enrich with the property "__v"
 */
export function addVersion0<K extends Record<string, any>>(to: K): K {
  return addProp("__v", 0, to);
}

