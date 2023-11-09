import { jest } from "@jest/globals";
import Mock = jest.Mock;
import { IOrder } from "@user-credits/core";

import type {
  ConstructEvent,
  PaymentIntentsCreate,
  PaymentIntentsRetrieve,
  StripeTypes,
} from "../../../../src/impl/service/StripeTypes";

// Create jest.fn mocks with the specified signatures
export const paymentIntentsCreateMock: Mock<PaymentIntentsCreate> =
  jest.fn<PaymentIntentsCreate>();
export const paymentIntentsRetrieveMock: Mock<PaymentIntentsRetrieve> =
  jest.fn<PaymentIntentsRetrieve>();
export const constructEventMock: Mock<ConstructEvent> =
  jest.fn<ConstructEvent>();

export function stripeMockInit(): StripeTypes {
  return {
    paymentIntents: {
      create: paymentIntentsCreateMock,
      retrieve: paymentIntentsRetrieveMock,
    },
    webhooks: {
      constructEvent: constructEventMock,
    },
  } as StripeTypes;
}

export function clearStripeMocks() {
  paymentIntentsCreateMock.mockClear();
  paymentIntentsRetrieveMock.mockClear();
  constructEventMock.mockClear();
}

// StripeMocks.ts

export function prepareCreatePaymentIntentMock(
  status: string,
  intentId: string = "payment_intent_id",
  total: number = 100,
): IOrder<string> {
  const expectedPaymentIntent = {
    client_secret: "client_secret_key",
    id: intentId,
    status,
  };

  paymentIntentsCreateMock.mockResolvedValue(expectedPaymentIntent as never);

  return {
    total,
  } as IOrder<string>;
}

export function prepareAfterPaymentExecutedMock(
  status: string,
  intentId: string = "payment_intent_id",
): IOrder<string> {
  const expectedPaymentIntent = {
    client_secret: "client_secret_key",
    id: intentId || "payment_intent_id",
    status,
  };

  paymentIntentsRetrieveMock.mockResolvedValue(expectedPaymentIntent as never);

  const order: IOrder<string> = {
    paymentIntentId: intentId,
  } as IOrder<string>;

  return order;
}
