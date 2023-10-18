import { DuplicateMatchesError } from "../errors";

export function copyFieldsWhenMatching<S extends object, T extends object>(
  sourceArray: S[],
  targetArray: T[],
  equalFields: (keyof T)[],
  fieldsToCopy: (keyof S)[],
  allowMultipleOccurrences: boolean,
): T[] {
  const toReturn = [...targetArray];

  for (const source of sourceArray) {
    // Find matches based on equalFields
    const matches = toReturn.filter((target) => {
      return equalFields.every((field) => {
        // eslint-disable-next-line no-prototype-builtins
        if (source.hasOwnProperty(field) && target.hasOwnProperty(field)) {
          return (
            // dirty assertion to hack TS
            (source as unknown as T)[field] ===
            target[field]
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
