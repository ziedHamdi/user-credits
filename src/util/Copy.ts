import { DuplicateMatchesError } from "../errors";

function defaultCustomEquals<T extends object, U extends object>(
  a: T,
  b: U,
): boolean {
  interface WithEquals {
    equals(b: object): boolean;
  }
  if (typeof a === "object" && typeof b === "object" && "equals" in a) {
    // Check if 'a' has an 'equals' method and use it
    return (a as unknown as WithEquals).equals(b);
  }
  // Fallback to default equality check using '=='
  return a as unknown == b as unknown;
}

export function copyFieldsWhenMatching<S extends object, T extends object>(
  sourceArray: S[],
  targetArray: T[],
  equalFields: (keyof T)[],
  fieldsToCopy: (keyof S)[],
  allowMultipleOccurrences: boolean = false,
  customEquals: (a: object, b: object) => boolean = defaultCustomEquals,
): T[] {
  const toReturn = [...targetArray];

  for (const source of sourceArray) {
    // Find matches based on equalFields
    const matches = toReturn.filter((target) => {
      return equalFields.every((field) => {
        // eslint-disable-next-line no-prototype-builtins
        if (source.hasOwnProperty(field) && target.hasOwnProperty(field)) {
          console.log(
            "comparing : ",
            (source as unknown as T)[field],
            " and ",
            target[field],
            "equal: ",
            customEquals((source as unknown as T)[field] as object, target[field] as object),
          );
          return (
            // dirty assertion to hack TS
            customEquals((source as unknown as T)[field] as object, target[field] as object)
          );
        }
        return true; // Property doesn't exist in either source or target; continue matching.
      });
    });

    if (!allowMultipleOccurrences && matches.length > 1) {
      throw new DuplicateMatchesError(
        "More than one match found for the source object.",
        matches,
      );
    } else if (matches.length >= 1 || allowMultipleOccurrences) {
      // Copy fields from source to matches
      for (const match of matches) {
        for (const field of fieldsToCopy) {
          // dirty assertion to hack TS
          (match as unknown as S)[field] = source[field];
        }
      }
    }
  }

  return toReturn;
}
