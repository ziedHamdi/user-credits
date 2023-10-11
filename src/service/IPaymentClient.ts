import { IOrder } from "../db/model";

export interface IPaymentClient<K extends object> {
  checkUserBalance(userId: string): Promise<number>;

  createPaymentIntent(order: IOrder<K>): Promise<IOrder<K> | null>;

  executePayment(order: IOrder<K>): Promise<IOrder<K>>;

  fetchUserBalance(userId: K): Promise<number>;

  handleWebhook(eventPayload: object, webhookSecret: string): void;
}
