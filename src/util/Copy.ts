import { DuplicateMatchesError } from "../errors";

export function copyFieldsWhenMatching<T extends object>(
  subscriptionsSource: T[],
  subscriptionsTarget: T[],
  equalFields: (keyof T)[],
  fieldsToCopy: (keyof T)[],
  allowMultipleOccurrences: boolean
): T[] {
  const updatedSubscriptions = [...subscriptionsTarget];

  for (const source of subscriptionsSource) {
    // Find matches based on equalFields
    const matches = updatedSubscriptions.filter((target) => {
      return equalFields.every((field) => source[field] === target[field]);
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
          match[field] = source[field];
        }
      }
    }
  }

  return updatedSubscriptions;
}
