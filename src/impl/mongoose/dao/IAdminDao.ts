/**
 * The methods in this interface were intentionally hidden from the base interface to oblige developers to cast before use for safety.
 */
import { IBaseDao, IMinimalId } from "@user-credits/core";

export interface IAdminDao<K extends IMinimalId, D> extends IBaseDao<K, D> {
  /**
   * Delete multiple rows by query
   */
  delete(query: object): Promise<number>;

  /**
   * Drops the entire collection
   */
  dropTable(): Promise<void>;
}
