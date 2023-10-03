import { BaseEntity } from "./BaseEntity";

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface ISubscription<K extends object> extends BaseEntity<K> {
  expires: Date;
  offerId: K;
  starts: Date;
  status: "pending" | "paid" | "refused";
}

export interface IUserCredits<K extends object> {
  subscriptions: (unknown extends ISubscription<K> ? unknown : never)[];
  tokens: number;
  userId: K;
}
