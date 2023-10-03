/**
 * Entities have instance method signatures copied from mongoose
 * @param K the type of the id dependency fields
 */
export interface BaseEntity<K> {
  save(): Promise<unknown>;
}
