import { jest } from "@jest/globals";

import {
  constructEventMock,
  paymentIntentsCreateMock,
  paymentIntentsRetrieveMock,
} from "../test/service/impl/mocks/StripeMocks";

let fs = jest.createMockFromModule("stripe");

fs = {
  ...fs,
  __esModule: true,
  paymentIntents: {
    create: paymentIntentsCreateMock,
    retrieve: paymentIntentsRetrieveMock,
  },
  webhooks: {
    constructEvent: constructEventMock,
  },
};

export default fs;
