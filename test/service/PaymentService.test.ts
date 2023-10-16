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
import { OrderStatus } from "../../src/db/model/IOrder";
import { PaymentError } from "../../src/errors";
import { IPaymentClient } from "../../src/service/IPaymentClient";
import { PaymentService } from "../../src/service/PaymentService";
import { TestContainerSingleton } from "../config/testContainer";
import { initMocks, ObjectId } from "./mocks/BaseService.mocks";

describe("PaymentService", () => {
  let daoFactoryMock: IDaoFactory<ObjectId>;
  let sampleUserId: ObjectId;
  let offerRoot1: IOffer<ObjectId>;
  let orderOfferRoot1: IOrder<ObjectId>;
  let subscriptionPaid1: ISubscription<ObjectId>;
  let subscriptionPaidRoot1: ISubscription<ObjectId>;
  let subscriptionPending1: ISubscription<ObjectId>;
  let subscriptionRefused1: ISubscription<ObjectId>;
  let paymentClient: IPaymentClient<ObjectId>;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({
      daoFactoryMock,
      offerRoot1,
      orderOfferRoot1,
      sampleUserId,
      subscriptionPaid1,
      subscriptionPaidRoot1,
      subscriptionPending1,
      subscriptionRefused1,
    } = mocks);
    paymentClient = (await TestContainerSingleton.getInstance()).resolve(
      "stripeMock",
    );;
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

  it("should update user credits after a successful payment", async () => {
    // Arrange
    const service = new PaymentService<ObjectId>(
      daoFactoryMock,
      paymentClient,
      defaultCurrency,
    );
    const userId = new Types.ObjectId();
    const order: IOrder<ObjectId> = orderOfferRoot1;
    order.status = "paid";
    order.paymentIntentSecret = "mockClientSecret"; // this value behaves as a payment success response (that triggers a paid status)

    // Mock the necessary methods and provide expected return values

    // Mock `getUserCredits` to return a userCredits object with a matching subscription
    const userCreditsMock: IUserCredits<ObjectId> = {
      markModified: jest.fn(), // Mock the markModified function
      offers: [] as unknown as [OrderStatus],
      save: jest.fn(), // Mock the save function
      subscriptions: [subscriptionPaidRoot1] as unknown as [
        ISubscription<ObjectId>,
      ], // A valid subscription
      userId,
    } as unknown as IUserCredits<ObjectId>;
    jest
      .spyOn(service, "getUserCredits" as keyof PaymentService<ObjectId>)
      .mockResolvedValue(userCreditsMock);

    // Mock the other method
    const afterPaymentExecutedMock = jest.spyOn(
      paymentClient,
      "afterPaymentExecuted" as keyof IPaymentClient<ObjectId>,
    );
    // afterPaymentExecutedMock.mockResolvedValue(order);

    // Act
    const updatedUserCredits = await service.afterExecute(order);

    // Assert
    // Verify that paymentClient.afterPaymentExecuted had been called
    expect(afterPaymentExecutedMock).toHaveBeenCalledWith(order);
    // Verify that the userCredits was marked as modified
    expect(userCreditsMock.markModified).toHaveBeenCalledWith("offers");

    // Verify that the userCredits was saved
    expect(userCreditsMock.save).toHaveBeenCalled();

    // Verify that the subscription's status was updated to "paid"
    expect(subscriptionPaidRoot1.status).toEqual("paid");

    // Verify that the subscription's tokens were updated correctly
    expect(subscriptionPaidRoot1.tokens).toEqual(
      subscriptionPaidRoot1.tokens + (order.tokenCount || 0),
    );

    // Verify that an offer with the same offerGroup as the order was added or updated
    const expectedOffer = {
      expires: expect.any(Date), // You can specify the date format if needed
      offerGroup: order.offerGroup,
      starts: expect.any(Date), // You can specify the date format if needed
      tokens: order.tokenCount || 0,
    };
    expect(userCreditsMock.offers).toContainEqual(
      expect.objectContaining(expectedOffer),
    );

    // Add more assertions based on your specific use case
  });
});
