export interface OrderStatus {
  date: Date;
  message: string;
  status: "pending" | "paid" | "refused";
}

export interface IOrder<K extends object> {
  history: [OrderStatus];
  offerId: K;
  status: "pending" | "paid" | "refused";
  tokenCount: number;
  userId: K;
}
