import { beforeEach, describe, it, jest } from "@jest/globals";
import type { IOrder } from "@user-credits/core";
import { expect } from "expect";

import { StripeClient } from "../../../src/impl/service/StripeClient";
import type { IConfigReader } from "../../../src/service/config/IConfigReader";
import {
  clearStripeMocks,
  paymentIntentsCreateMock,
  paymentIntentsRetrieveMock,
  prepareAfterPaymentExecutedMock,
  prepareCreatePaymentIntentMock,
  stripeMockInit,
} from "./mocks/StripeMocks";

const intentId = "payment_intent_id";

describe("StripeClient", () => {
  let stripeClient: StripeClient<string>;

  beforeEach(() => {
    const configReaderMock = {
      currency: "usd",
      paymentApiVersion: jest.fn(),
      paymentSecretKey: jest.fn(),
    } as unknown as IConfigReader;

    stripeClient = new StripeClient(configReaderMock, stripeMockInit());
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
    expect(paymentIntentsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: amount * 100,
        currency: "usd",
        description: expect.stringContaining("Payment for Order"),
      }),
    );
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
