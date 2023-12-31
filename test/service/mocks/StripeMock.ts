import {
  IMinimalId,
  IOrder,
  IOrderStatus,
  IPaymentClient,
} from "@user-credits/core";

import { IStripeWebhookEventPayload } from "../../../src/service/IStripeWebhookEventPayload";

export const MOCK_VALUES = {
  paymentIntentSecretAsPaid: "IntentAsPaid",
};

export class StripeMock<K extends IMinimalId> implements IPaymentClient<K> {
  private readonly currency: string;

  constructor() {
    this.currency = "usd"; // Set a default currency for testing
  }

  async createPaymentIntent(order: IOrder<K>): Promise<IOrder<K> | null> {
    // Simulate creating a payment intent and updating the order
    order.paymentIntentId = "mockPaymentIntentId";
    order.paymentIntentSecret = MOCK_VALUES.paymentIntentSecretAsPaid;
    return order;
  }

  async afterPaymentExecuted(order: IOrder<K>): Promise<IOrder<K>> {
    // Simulate executing a payment and updating the order status
    if (order.paymentIntentSecret === MOCK_VALUES.paymentIntentSecretAsPaid) {
      order.status = "paid";
      this.addHistoryItem(order, {
        message: "Payment succeeded",
        status: "paid",
      } as IOrderStatus);
    } else {
      order.status = "refused";
      this.addHistoryItem(order, {
        message: "Payment failed",
        status: "refused",
      } as IOrderStatus);
    }
    order.save = jest.fn(); // will be needed in the process
    return order;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchUserBalance(userId: K): Promise<number> {
    // Simulate fetching the user's balance (replace with your logic)
    // For this mock, return a static balance
    return 1000;
  }

  // Simulate handling webhook callbacks
  handleWebhook(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    eventPayload: IStripeWebhookEventPayload,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webhookSecret: string,
  ) {
    // For testing purposes, you can return a mock Stripe event
    const mockEvent = {
      id: "mockEventId",
      type: "payment_intent.succeeded",
      // Add more event properties as needed for testing
    };
    return mockEvent;
  }

  private addHistoryItem(order: IOrder<K>, historyItem: IOrderStatus) {
    if (!order.history) {
      order.history = [] as unknown as [IOrderStatus];
    }
    historyItem.date = new Date();
    order.history.push(historyItem);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkUserBalance(userId: K): Promise<number> {
    return Promise.resolve(0);
  }
}
