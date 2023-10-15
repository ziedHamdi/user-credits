import { jest } from "@jest/globals";
import Mock = jest.Mock;

type PaymentIntentsCreate = (params: any) => Promise<any>;
type PaymentIntentsRetrieve = (paymentIntentId: string) => Promise<any>;
type ConstructEvent = (rawBody: string, sig: string, secret: string) => any;

// Create jest.fn mocks with the specified signatures
export const paymentIntentsCreateMock: Mock<PaymentIntentsCreate> = jest.fn<PaymentIntentsCreate>();
export const paymentIntentsRetrieveMock: Mock<PaymentIntentsRetrieve> = jest.fn<PaymentIntentsRetrieve>();
export const constructEventMock: Mock<ConstructEvent> = jest.fn<ConstructEvent>();


export function stripeMockInit() {
  return {
    __esModule: true,
    default: {
      paymentIntents: {
        create: paymentIntentsCreateMock,
        retrieve: paymentIntentsRetrieveMock,
      },
      webhooks: {
        constructEvent: constructEventMock,
      },
    },
  };
}

export function clearStripeMocks() {
  paymentIntentsCreateMock.mockClear();
  paymentIntentsRetrieveMock.mockClear();
  constructEventMock.mockClear();
}
