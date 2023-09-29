export interface OrderStatus {
  date: Date;
  message: string;
  status: "pending" | "paid" | "refused";
}

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface IOrder<K extends object> {
  history: [OrderStatus];
  offerId: K;
  status: "pending" | "paid" | "refused";
  tokenCount: number;
  userId: K;
}
