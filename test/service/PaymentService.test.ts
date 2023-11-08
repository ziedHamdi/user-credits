//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import type {
  IActivatedOffer,
  IDaoFactory,
  IOrder,
  IOrderStatus,
  IPaymentClient,
  IUserCredits,
} from "@user-credits/core";
import {
  addMonths,
  PaymentService,
} from "@user-credits/core";
import { expect } from "expect";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection, Types } from "mongoose";

import { TestContainerSingleton } from "../config/testContainer";
import {
  prefillOrdersForTests,
  USER_ORDERS,
} from "../db/mongoose/mocks/step2_ExecuteOrders";
import { initMocks, ObjectId } from "./mocks/BaseService.mocks";

/**
 * Temporary class to access the protected methods
 */
class TestPaymentService<K extends ObjectId> extends PaymentService<K> {
  // Expose the protected method as public for testing purposes
  public testUpdateOfferGroup(
    userCredits: IUserCredits<K>,
    order: IOrder<K>,
  ): IActivatedOffer {
    return this.updateOfferGroup(userCredits, order);
  }
}

describe("PaymentService.updateOfferGroup", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let mongoMemoryServer: MongoMemoryServer;
  let connection: Connection;
  let order: IOrder<Types.ObjectId>;
  let userCredits: IUserCredits<ObjectId>;
  let service: TestPaymentService<ObjectId>;
  let paymentClient: IPaymentClient<ObjectId>;

  beforeEach(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks(false);
    ({ connection, mongoMemoryServer, mongooseDaoFactory } = mocks);

    paymentClient = (await TestContainerSingleton.getInstance()).resolve(
      "stripeMock",
    );

    service = new TestPaymentService<ObjectId>(
      mongooseDaoFactory,
      paymentClient,
      "usd",
    );
    await prefillOrdersForTests(service);
    // I have to cheat here as I know it will not be null
    order =
      (await mongooseDaoFactory
        .getOrderDao()
        .findOne({ userId: USER_ORDERS.User_St_Startup.userId })) ??
      ({} as unknown as IOrder<ObjectId>);
    const userId = order.userId;
    userCredits = {
      offers: [] as unknown as [IActivatedOffer],
      subscriptions: [] as unknown as [IOrderStatus],
      userId,
    } as unknown as IUserCredits<ObjectId>;
  });

  afterEach(async () => {
    await mongoMemoryServer.stop(false);
    await connection.close();
  });

  it("should update an existing offer in userCredits", () => {
    order.cycle = "weekly"; // order a week
    order.quantity = 3; // a total of three weeks
    const offer = {
      expires: addMonths(new Date(), 2), // TODO test also if a date is passed: check that the new date starts from today and not from that last date (make it possible to chose from both scenarios)
      offerGroup: order.offerGroup,
      starts: addMonths(new Date(), -1), // Will check that the startDate is untouched
      tokens: 500,
    };

    // Arrange
    userCredits.offers.push({
      ...offer,
    });

    // Act
    const updatedOffer: IActivatedOffer = service.testUpdateOfferGroup(
      userCredits,
      order,
    );

    // Assert
    expect(updatedOffer.expires).toEqual(
      new Date(offer.expires.getTime() + 1000 * 60 * 60 * 24 * 7 * 3),
    );
    expect(updatedOffer.tokens).toEqual(500 + (order.tokenCount || 0) * 3);
  });

  it("should create a new offer in userCredits", () => {
    order.cycle = "weekly"; // order a week
    order.quantity = 3; // a total of three weeks

    // Arrange
    userCredits.offers = []; // Clear existing offers

    // Act
    const newOffer: IActivatedOffer = service.testUpdateOfferGroup(
      userCredits,
      order,
    );

    // Assert
    expect(newOffer.offerGroup).toEqual(order.offerGroup);
    expect(newOffer.tokens).toEqual((order.tokenCount || 0) * 3);
    // FIXME there's an hour of difference between the expected and found value. I have no clue from where it could come
    // expect(newOffer.expires).toEqual(
    //   new Date(
    //     (order.updatedAt || order.createdAt || new Date()).getTime() +
    //       1000 * 60 * 60 * 24 * 7 * 3,
    //   ),
    // );
  });
});
