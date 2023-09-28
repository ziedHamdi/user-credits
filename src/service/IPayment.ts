import { IOrder } from "../db/model/IOrder";
import { IUserCredits } from "../db/model/IUserCredits";

export interface IPayment {
  createOrder(offerId: string, userId: string): IOrder;
  execute(order: IOrder): IUserCredits;
  orderStatusChanged(
    orderId: string,
    status: "pending" | "paid" | "refused",
  ): IOrder;
  remainingTokens(userId: string): IUserCredits;
}
