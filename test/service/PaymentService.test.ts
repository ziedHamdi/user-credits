//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
import { beforeAll, describe, it } from "@jest/globals";
import { expect } from "expect";
import { Types } from "mongoose";

import { IDaoFactory } from "../../src/db/dao";
import {
  IOffer,
  IOrder,
  ISubscription,
  IUserCredits,
} from "../../src/db/model";
import { PaymentError } from "../../src/errors";
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
    paymentClient = (await TestContainerSingleton.getInstance()).resolve(
      "stripeMock",
    );
    sampleUserCredits = {
      subscriptions: [subscriptionPaid1, subscriptionPending1] as unknown as [
        ISubscription<ObjectId>,
      ], // Use the created instances
      tokens: 100, // Sample token balance
      userId: sampleUserId,
    } as unknown as IUserCredits<ObjectId>;
  });

  const defaultCurrency = "usd";

  it("should throw an error if userCredits.subscriptions doesn't contain the current order", async () => {
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

    // Mock `getUserCredits` to return a userCredits object without a matching subscription
    const getUserCreditsMock = jest.spyOn(
      service,
      "getUserCredits" as keyof PaymentService<ObjectId>,
    );
    getUserCreditsMock.mockResolvedValue({
      offers: [],
      subscriptions: [], // No matching subscription
      userId,
    } as unknown as IUserCredits<ObjectId>);

    // Mock the other method
    const afterPaymentExecutedMock = jest.spyOn(
      paymentClient,
      "afterPaymentExecuted" as keyof IPaymentClient<ObjectId>,
    );
    afterPaymentExecutedMock.mockResolvedValue(order);

    // Act and Assert
    // Expect this to throw a PaymentError
    await expect(async () => {
      await service.afterExecute(order);
    }).rejects.toThrow(PaymentError);

    // Ensure the error message is what you expect
    await expect(async () => {
      await service.afterExecute(order);
    }).rejects.toThrowError(
      /Illegal state: userCredits\(.+\) has no subscription for orderId \(.+\)./,
    );

    // You can add more specific assertions if needed
  });
});
