import { IOrder } from "../../../src/db/model";
import { OrderStatus } from "../../../src/db/model/IOrder";
import { IPaymentClient } from "../../../src/service/IPaymentClient";
import { ObjectId } from "./BaseService.mocks";

export class StripeMock implements IPaymentClient<IOrder<ObjectId>> {
  private readonly currency: string;

  constructor() {
    this.currency = "usd"; // Set a default currency for testing
  }

  async createPaymentIntent(
    order: IOrder<ObjectId>,
  ): Promise<IOrder<ObjectId> | null> {
    // Simulate creating a payment intent and updating the order
    order.paymentIntentId = "mockPaymentIntentId";
    order.paymentIntentSecret = "mockClientSecret";
    return order;
  }

  async afterPaymentExecuted(
    order: IOrder<ObjectId>,
  ): Promise<IOrder<ObjectId> | null> {
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
  async fetchUserBalance(userId: string): Promise<number> {
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

  private addHistoryItem(order: IOrder<ObjectId>, historyItem: OrderStatus) {
    if (!order.history) {
      order.history = [];
    }
    historyItem.date = new Date();
    order.history.push(historyItem);
  }
}
