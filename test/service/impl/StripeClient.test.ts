import { beforeEach, describe, it, jest } from "@jest/globals";
import { expect } from "expect";

import { IOrder } from "../../../src/db/model";
import { StripeClient } from "../../../src/impl/service/StripeClient";
import { IConfigReader } from "../../../src/service/config/IConfigReader";
import {
  constructEventMock,
  mockedStripe,
  paymentIntentsCreateMock,
  paymentIntentsRetrieveMock,
} from "./mocks/StripeMocks";

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: paymentIntentsCreateMock,
      },
    };
  });
});

describe("StripeClient", () => {
  let stripeClient: StripeClient<string>;

  beforeEach(() => {
    // Mock the 'stripe' module and provide a factory function
    mockedStripe.mockImplementation((apiKey: string, options?: any) => {
      return {
        paymentIntents: {
          create: paymentIntentsCreateMock,
          retrieve: paymentIntentsRetrieveMock,
        },
        webhooks: {
          constructEvent: constructEventMock,
        },
      };
    });

    const configReaderMock = {
      currency: jest.fn(() => "usd"),
      paymentApiVersion: jest.fn(),
      paymentSecretKey: jest.fn(),
    } as unknown as IConfigReader;

    stripeClient = new StripeClient(configReaderMock);
  });

  it("should create a payment intent", async () => {
    // Arrange
    const order: IOrder<string> = {
      // Initialize order object with necessary properties
      total: 100,
    } as unknown as IOrder<string>;

    const expectedPaymentIntent = {
      client_secret: "client_secret_key",
      id: "payment_intent_id",
      status: "requires_payment_method",
    };

    paymentIntentsCreateMock.mockResolvedValue(expectedPaymentIntent as never);

    // Act
    const result = await stripeClient.createPaymentIntent(order);

    // Assert
    expect(paymentIntentsCreateMock).toHaveBeenCalledWith({
      amount: 10000, // 100 dollars in cents
      currency: "usd", // Replace with your desired currency
      description: expect.stringContaining("Payment for Order"),
    });
    expect(result).toEqual(
      expect.objectContaining({
        paymentIntentId: "payment_intent_id",
        paymentIntentSecret: "client_secret_key",
      }),
    );
  });

  it("should handle afterPaymentExecuted", async () => {
    // Arrange
    const order: IOrder<string> = {
      paymentIntentId: "payment_intent_id",
    } as IOrder<string>;

    const expectedPaymentIntent = {
      id: "payment_intent_id",
      next_action: null,
      status: "succeeded",
    };

    paymentIntentsRetrieveMock.mockResolvedValue(
      expectedPaymentIntent as never,
    );

    // Act
    const result = await stripeClient.afterPaymentExecuted(order);

    // Assert
    expect(paymentIntentsRetrieveMock).toHaveBeenCalledWith(
      "payment_intent_id",
    );
    expect(result?.status).toBe("paid");
    expect(result?.history?.length).toBe(1);
    expect(result?.history?.[0]?.status).toBe("paid");
  });
});
