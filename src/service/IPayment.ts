import { IOffer } from "../db/model/IOffer";
import { IOrder } from "../db/model/IOrder";
import { IUserCredits } from "../db/model/IUserCredits";
import { IDaoFactory } from "../db/dao";

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface IPayment<K extends object | null> {
  getDaoFactory(): IDaoFactory<K>;
  // createOrder(offerId: unknown, userId: unknown): Promise<IOrder<K>>;
  // execute(order: IOrder<K>): Promise<IUserCredits<K>>;
  loadOffers(userId: unknown): Promise<IOffer<K>[]>;
  // orderStatusChanged(
  //   orderId: unknown,
  //   status: "pending" | "paid" | "refused",
  // ): Promise<IOrder<K>>;
  // remainingTokens(userId: unknown): Promise<IUserCredits<K>>;
}
