import { expect, jest, test } from "@jest/globals";

class StripeMock {
  constructor(apiKey: string, options?: any) {
    // Implement your mock behavior here, if needed
  }
}
export const mockedStripe = jest.fn(
  (apiKey: string, options?: any) => new StripeMock(apiKey, options),
);
jest.mock("stripe", () => mockedStripe);

export const paymentIntentsCreateMock = jest.fn();
export const paymentIntentsRetrieveMock = jest.fn();
export const constructEventMock = jest.fn();

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

// export const stripeMock = jest.mock(
//   "stripe",
//   stripeMockInit,
// );
export function clearStripeMocks() {
  // Clear all instances and calls to constructor
  paymentIntentsCreateMock.mockClear();
  paymentIntentsRetrieveMock.mockClear();
  constructEventMock.mockClear();
}
