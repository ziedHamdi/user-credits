export interface OrderStatus {
  date: Date;
  message: string;
  status: "pending" | "paid" | "refused";
}

export interface IOrder {
  // history: [OrderStatus];
  offerId: unknown;
  status: "pending" | "paid" | "refused";
  tokenCount: number;
  userId: unknown;
}
