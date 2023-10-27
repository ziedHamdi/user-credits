import { beforeEach, describe, it, jest } from "@jest/globals";
import { expect } from "expect";

import { IOrder } from "../../../src/db/model";
import { StripeClient } from "../../../src/impl/service/StripeClient";
import { IConfigReader } from "../../../src/service/config/IConfigReader";
import {
  clearStripeMocks,
  constructEventMock,
  paymentIntentsCreateMock,
  paymentIntentsRetrieveMock,
  prepareAfterPaymentExecutedMock,
  prepareCreatePaymentIntentMock,
} from "./mocks/StripeMocks";

const intentId = "payment_intent_id";

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => {
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
});

describe("StripeClient", () => {
  let stripeClient: StripeClient<string>;

  beforeEach(() => {
    const configReaderMock = {
      currency: jest.fn(() => "usd"),
      paymentApiVersion: jest.fn(),
      paymentSecretKey: jest.fn(),
    } as unknown as IConfigReader;

    stripeClient = new StripeClient(configReaderMock);
    clearStripeMocks();
  });

  it("should create a payment intent", async () => {
    const amount: number = 100;
    // Arrange
    const order = prepareCreatePaymentIntentMock(
      "requires_payment_method",
      intentId,
      amount,
    );

    // Act
    const result = await stripeClient.createPaymentIntent(order);

    // Assert
    expect(paymentIntentsCreateMock).toHaveBeenCalledWith({
      amount: amount * 100, // 100 dollars in cents
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

  it("should handle exception when creating a payment intent", async () => {
    // Arrange
    const order = prepareCreatePaymentIntentMock(
      "requires_payment_method",
      "error_case",
    );
    const error = new Error("Test error");
    paymentIntentsCreateMock.mockRejectedValue(error);

    // Act and Assert
    await expect(stripeClient.createPaymentIntent(order)).rejects.toThrow(
      "Error creating payment intent",
    );
  });

  it("should handle afterPaymentExecuted when status is 'succeeded'", async () => {
    const order = prepareAfterPaymentExecutedMock("succeeded", intentId);

    // Act
    const result = await stripeClient.afterPaymentExecuted(order);

    // Assert
    expect(paymentIntentsRetrieveMock).toHaveBeenCalledWith(intentId);
    expect(result?.status).toBe("paid");
    expect(result?.history?.length).toBe(1);
    expect(result?.history?.[0]?.status).toBe("paid");
  });

  it("should handle afterPaymentExecuted when status is 'requires_payment_method'", async () => {
    const order = prepareAfterPaymentExecutedMock(
      "requires_payment_method",
      intentId,
    );

    // Act
    const result = await stripeClient.afterPaymentExecuted(order);

    // Assert
    expect(paymentIntentsRetrieveMock).toHaveBeenCalledWith(intentId);
    expect(result?.status).toBe("refused");
    expect(result?.history?.length).toBe(1);
    expect(result?.history?.[0]?.status).toBe("refused");
  });

  it("should handle afterPaymentExecuted when status is 'requires_action'", async () => {
    const order = prepareAfterPaymentExecutedMock("requires_action", intentId);

    // Act
    const result = await stripeClient.afterPaymentExecuted(order);

    // Assert
    expect(paymentIntentsRetrieveMock).toHaveBeenCalledWith(intentId);
    expect(result?.status).toBe("error");
    expect(result?.history?.length).toBe(1);
    expect(result?.history?.[0]?.status).toBe("error");
  });
  it("should handle exception when retrieving a payment intent", async () => {
    // Arrange
    const order: IOrder<string> = {
      paymentIntentId: intentId,
    } as IOrder<string>;

    const error = new Error("Test error");
    paymentIntentsRetrieveMock.mockRejectedValue(error);

    // Act and Assert
    await expect(stripeClient.afterPaymentExecuted(order)).rejects.toThrow(
      "Error executing payment",
    );
  });
});
