export interface IOrderStatus {
  date: Date;
  message: string;
  status: "pending" | "paid" | "refused" | "error";
}