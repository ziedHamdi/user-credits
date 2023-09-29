import { IOffer } from "../db/model/IOffer";
import { IOrder } from "../db/model/IOrder";
import { IUserCredits } from "../db/model/IUserCredits";

export interface IPayment<T extends object> {
  createOrder(offerId: unknown, userId: unknown): Promise<IOrder<T>>;
  execute(order: IOrder<T>): Promise<IUserCredits>;
  loadOffers(userId: unknown): IOffer[];
  orderStatusChanged(
    orderId: unknown,
    status: "pending" | "paid" | "refused",
  ): Promise<IOrder<T>>;
  remainingTokens(userId: unknown): Promise<IUserCredits>;
}
