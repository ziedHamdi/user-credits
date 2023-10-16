//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
import { afterAll, beforeAll, beforeEach, describe, it } from "@jest/globals";
import { Types } from "mongoose";

import { IDaoFactory } from "../../src/db/dao";
import {
  IOffer,
  IOrder,
  ISubscription,
  IUserCredits,
} from "../../src/db/model";
import { IPaymentClient } from "../../src/service/IPaymentClient";
import { PaymentService } from "../../src/service/PaymentService";
import { TestContainerSingleton } from "../config/testContainer";
import { initMocks, ObjectId } from "./mocks/BaseService.mocks";

describe("PaymentService", () => {
  let daoFactoryMock: IDaoFactory<ObjectId>;
  let sampleUserId: ObjectId;
  let offerRoot1: IOffer<ObjectId>;
  let subscriptionPaid1: ISubscription<ObjectId>;
  let subscriptionPending1: ISubscription<ObjectId>;
  let subscriptionRefused1: ISubscription<ObjectId>;
  let sampleUserCredits: IUserCredits<ObjectId>;
  let paymentClient: IPaymentClient<ObjectId>;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({
      daoFactoryMock,
      offerRoot1,
      sampleUserId,
      subscriptionPaid1,
      subscriptionPending1,
      subscriptionRefused1,
    } = mocks);
    paymentClient = (
      await TestContainerSingleton.getInstance()
    ).resolve("stripeMock");
    sampleUserCredits = {
      subscriptions: [subscriptionPaid1, subscriptionPending1] as unknown as [
        ISubscription<ObjectId>,
      ], // Use the created instances
      tokens: 100, // Sample token balance
      userId: sampleUserId,
    } as unknown as IUserCredits<ObjectId>;
  });

  const defaultCurrency = "usd";

  it("should update user credits after a successful payment", async () => {
    // Arrange
    const service = new PaymentService<ObjectId>(
      daoFactoryMock,
      paymentClient,
      defaultCurrency,
    );
    const userId = new Types.ObjectId();
    const order: IOrder<ObjectId> = await service.createOrder(
      offerRoot1._id,
      userId,
    );

    // Mock the necessary methods and provide expected return values
    const getUserCreditsMock = jest.spyOn(service, "getUserCredits" as keyof PaymentService<ObjectId>);
    getUserCreditsMock.mockResolvedValue({
      offers: [],
      subscriptions: [],
      userId,
    } as unknown as IUserCredits<ObjectId>);
    const afterPaymentExecutedMock = jest.spyOn(
      paymentClient,
      "afterPaymentExecuted" as keyof IPaymentClient<ObjectId>,
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
