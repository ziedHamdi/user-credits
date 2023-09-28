import { IOrder } from "../db/model/IOrder";
import { IUserCredits } from "../db/model/IUserCredits";

export interface IPayment {
  createOrder(offerId: string, userId: string): Promise<IOrder>;
  execute(order: IOrder): Promise<IUserCredits>;
  orderStatusChanged(
    orderId: string,
    status: "pending" | "paid" | "refused",
  ): Promise<IOrder>;
  remainingTokens(userId: string): Promise<IUserCredits>;
}
