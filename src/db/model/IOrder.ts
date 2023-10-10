import { BaseEntity } from "./BaseEntity";

export interface OrderStatus {
  date: Date;
  message: string;
  status: "pending" | "paid" | "refused";
}

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface IOrder<K extends object> extends BaseEntity<K> {
  country: string | null;
  history: [OrderStatus] | null;
  offerId: K;
  quantity: number;
  status: "pending" | "paid" | "refused";
  taxRate: number | null;
  tokenCount: number | null;
  total: number;
  userId: K;
}
