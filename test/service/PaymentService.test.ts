//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
import { afterAll, beforeAll, beforeEach, describe, it } from "@jest/globals";
import { beforeAll } from "@jest/globals";

import { IDaoFactory } from "../../src/db/dao";
import { IOrder, ISubscription, IUserCredits } from "../../src/db/model";
import { IPaymentClient } from "../../src/service/IPaymentClient";
import { PaymentService } from "../../src/service/PaymentService";
import { TestContainerSingleton } from "../config/testContainer";
import { initMocks, ObjectId } from "./mocks/BaseService.mocks";

describe("PaymentService", async () => {
  let daoFactoryMock: IDaoFactory<ObjectId>;
  let sampleUserId: ObjectId;
  let subscriptionPaid1: ISubscription<ObjectId>;
  let subscriptionPending1: ISubscription<ObjectId>;
  let subscriptionRefused1: ISubscription<ObjectId>;
  let sampleUserCredits: IUserCredits<ObjectId>;
  const paymentClient: IPaymentClient<ObjectId> = (
    await TestContainerSingleton.getInstance()
  ).resolve("stripeMock");

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({
      daoFactoryMock,
      sampleUserId,
      subscriptionPaid1,
      subscriptionPending1,
      subscriptionRefused1,
    } = mocks);
    sampleUserCredits = {
      subscriptions: [subscriptionPaid1, subscriptionPending1], // Use the created instances
      tokens: 100, // Sample token balance
      userId: sampleUserId,
    } as IUserCredits<ObjectId>;
  });

  const defaultCurrency = "usd";

  it("should update user credits after a successful payment", async () => {
    // Arrange
    const service = new PaymentService(
      daoFactoryMock,
      paymentClient,
      defaultCurrency,
    );
    const userId = "user123";
    const order: IOrder<ObjectId> = {
      // Initialize your order object with necessary properties
    };

    // Mock the necessary methods and provide expected return values
    const getUserCreditsMock = jest.spyOn(service, "getUserCredits");
    getUserCreditsMock.mockResolvedValue({
      offers: [],
      subscriptions: [],
      userId,
    } as IUserCredits<ObjectId>);
    const afterPaymentExecutedMock = jest.spyOn(
      paymentClient,
      "afterPaymentExecuted",
    );
    afterPaymentExecutedMock.mockResolvedValue(order);

    // Act
    const updatedUserCredits = await service.afterExecute(order);

    // Assert
    expect(getUserCreditsMock).toHaveBeenCalledWith(userId);
    expect(afterPaymentExecutedMock).toHaveBeenCalledWith(order);
    // Add more assertions based on your specific use case
  });
});
