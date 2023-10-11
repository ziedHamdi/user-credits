import { BaseEntity } from "./BaseEntity";

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface ISubscription<K extends object> {
  cycle:
    | "once"
    | "weekly"
    | "bi-weekly"
    | "monthly"
    | "trimester"
    | "semester"
    | "yearly";
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
