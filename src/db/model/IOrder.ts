import { BaseEntity } from "./BaseEntity";

export interface OrderStatus {
  date: Date;
  message: string;
  status: "pending" | "paid" | "refused"| "error";
}

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface IOrder<K extends object> extends BaseEntity<K> {
  country: string | null;
  history: [OrderStatus] | null;
  offerId: K;
  /**
   * This field value can change if an intent is abandoned: a new intent can be created to complete the payment.
   */
  paymentIntentId: string | null;
  /**
   * This field is not saved to db, it only carries info during the session
   */
  paymentIntentSecret: string | null;
  quantity: number;
  status: "pending" | "paid" | "refused" | "error";
  taxRate: number | null;
  tokenCount: number | null;
  total: number;
  userId: K;
}
