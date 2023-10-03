import { IOffer } from "../model/IOffer";
import { IOrder } from "../model/IOrder";
import { ISubscription, IUserCredits } from "../model/IUserCredits";

export interface IUserCreditsDao<K extends object, D extends IUserCredits<K>>
  extends BaseDAO<D> {
  findByUserId(userId: K): Promise<ISubscription<K>[]>;
}

export interface IOfferDao<K extends object, D extends IOffer<K>>
  extends BaseDAO<D> {}

export interface IOrderDao<K extends object, D extends IOrder<K>>
  extends BaseDAO<D> {}

export interface ISubscriptionDao<K extends object> extends BaseDAO<K> {}

export interface BaseDAO<D extends object> {
  // Count documents that match a query
  count(query: object): Promise<number>;

  // Create a new document
  create(data: Partial<D>): Promise<D>;

  // Delete a document by ID
  deleteById(userId: string): Promise<boolean>;

  // Find documents that match a query
  find(query: object): Promise<D[]>;

  findById(userId: object): Promise<D | null>;

  // Update a document by ID
  updateById(userId: string, update: Partial<D>): Promise<D | null>;
}
