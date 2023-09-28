import { IOrder } from "../db/model/IOrder";
import { IUserCredits } from "../db/model/IUserCredits";

export interface IPayment<T extends object> {
  createOrder(offerId: T, userId: T): Promise<IOrder>;
  execute(order: IOrder<T>): Promise<IUserCredits>;
  orderStatusChanged(
    orderId: T,
    status: "pending" | "paid" | "refused",
  ): Promise<IOrder<T>>;
  remainingTokens(userId: T): Promise<IUserCredits>;
}
