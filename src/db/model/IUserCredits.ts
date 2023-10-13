import { BaseEntity } from "./BaseEntity";
import { OfferCycle } from "./IOffer";

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface ISubscription<K extends object> {
  /**
   * Only allowed to have a value when cycle=custom. Expresses the order duration before expiry in seconds.
   */
  customCycle: number | null;
  cycle: OfferCycle;
  /** Check documentation in @IOffer */
  offerGroup: string;
  offerId: K;
  orderId: K;
  starts: Date;
  status: "pending" | "paid" | "refused" | "error";
  tokens: number;
}

export interface IActivatedOffer {
  expires: Date;
  /** Check documentation in @IOffer */
  offerGroup: string;
  starts: Date;
  tokens: number;
}

export interface IUserCredits<K extends object> extends BaseEntity<K> {
  offers: IActivatedOffer[];
  subscriptions: (unknown extends ISubscription<K> ? unknown : never)[];
  userId: K;
}
