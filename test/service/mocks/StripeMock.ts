import { IOrder, MinimalId } from "../../../src/db/model";
import { OrderStatus } from "../../../src/db/model/IOrder";
import { IPaymentClient } from "../../../src/service/IPaymentClient";

export class StripeMock<K extends MinimalId> implements IPaymentClient<K> {
  private readonly currency: string;

  constructor() {
    this.currency = "usd"; // Set a default currency for testing
  }

  async createPaymentIntent(
    order: IOrder<K>,
  ): Promise<IOrder<K> | null> {
    // Simulate creating a payment intent and updating the order
    order.paymentIntentId = "mockPaymentIntentId";
    order.paymentIntentSecret = "mockClientSecret";
    return order;
  }

  async afterPaymentExecuted(
    order: IOrder<K>,
  ): Promise<IOrder<K>> {
    // Simulate executing a payment and updating the order status
    if (order.paymentIntentSecret === "mockClientSecret") {
      order.status = "paid";
      this.addHistoryItem(order, {
        message: "Payment succeeded",
        status: "paid",
      } as OrderStatus);
    } else {
      order.status = "refused";
      this.addHistoryItem(order, {
        message: "Payment failed",
        status: "refused",
      } as OrderStatus);
    }
    return order;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchUserBalance(userId: K): Promise<number> {
    // Simulate fetching the user's balance (replace with your logic)
    // For this mock, return a static balance
    return 1000;
  }

  // Simulate handling webhook callbacks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleWebhook(eventPayload: any, webhookSecret: string) {
    // For testing purposes, you can return a mock Stripe event
    const mockEvent = {
      id: "mockEventId",
      type: "payment_intent.succeeded",
      // Add more event properties as needed for testing
    };
    return mockEvent;
  }

  private addHistoryItem(order: IOrder<K>, historyItem: OrderStatus) {
    if (!order.history) {
      order.history = [] as unknown as [OrderStatus];
    }
    historyItem.date = new Date();
    order.history.push(historyItem);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkUserBalance(userId: K): Promise<number> {
    return Promise.resolve(0);
  }
}
