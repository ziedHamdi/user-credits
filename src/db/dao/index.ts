import { IOffer } from "../model/IOffer";
import { ISubscription, IUserCredits } from "../model/IUserCredits";

export interface IUserCreditsDAO<K extends object> extends TypicalDAO<K> {
  findByUserId(userId: K): Promise<ISubscription<K>[]>;
}

export interface IOfferDAO<K extends object> extends TypicalDAO<K> {}

export interface ISubscriptionDAO<K extends object> extends TypicalDAO<K> {}

export interface TypicalDAO<K extends object> {
  find(query: object): Promise<IOffer<K>[]>;
  findById(id: object): Promise<IUserCredits<K>>;
}
