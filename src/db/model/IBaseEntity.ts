/**
 * Entities have instance method signatures copied from mongoose
 * @param K the type of the id dependency fields
 */
export interface IBaseEntity<K> {
  _id: K;
  markModified(field: string): void;
  save(): Promise<unknown>;
}
