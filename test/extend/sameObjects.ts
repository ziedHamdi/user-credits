import type { MatcherFunction } from "expect";

declare module "expect" {
  interface ObjectMatchers {
    toHaveSameFields(other: object): void;
  }
  interface Matchers<R> {
    toHaveSameFields(other: object): R;
  }
}

const toHaveSameFields: MatcherFunction<[expected: Record<string, any>]> = (
  received,
  expected,
) => {
  const receivedKeys = Object.keys(received as Record<string, any>);
  const expectedKeys = Object.keys(expected);

  // Check if the number of fields is the same
  if (receivedKeys.length !== expectedKeys.length) {
    return {
      message: () => `Expected objects to have the same number of fields.`,
      pass: false,
    };
  }

  const differences: string[] = [];

  // Compare fields and their values
  for (const key of receivedKeys) {
    const receivedValue = (received as Record<string, any>)[key];
    const expectedValue = expected[key];

    if (!deepEquals(receivedValue, expectedValue)) {
      differences.push(
        `${key} : (expected '${expectedValue}', received '${receivedValue}')`,
      );
    }
  }

  // Determine if the objects have the same fields
  const pass = differences.length === 0;

  const message = pass
    ? () => `Expected objects not to have the same fields.`
    : () =>
        `Expected objects to have the same fields, but found differences in: ${differences.join(
          ", ",
        )}.`;

  return {
    message,
    pass,
  };
};

function deepEquals(a: any, b: any): boolean {
  // Handle null values
  if (a === null && b === null) {
    return true;
  }

  // Check if types are different
  if (typeof a !== typeof b) {
    return false;
  }

  // Handle non-object types
  if (typeof a !== "object") {
    return a === b;
  }

  // Handle arrays
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  // Handle objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEquals(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

export { toHaveSameFields };
