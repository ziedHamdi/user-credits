/**
 * Represents the minimal requirement for an id representation
 *
 * FIXME Add equals(id1:MinimalId, id2:MinimalId) as a utility method to verify equality
 */
export interface IMinimalId {
  toString(): string;
}
