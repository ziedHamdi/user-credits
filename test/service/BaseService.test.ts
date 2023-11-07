//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
import { afterEach, beforeAll, beforeEach, describe, it } from "@jest/globals";
import expect from "expect";

import { IDaoFactory, IOrderDao } from "../../src/db/dao"; // Import the actual path
import {
  IMinimalId,
  IOffer,
  IOrder,
  ISubscription,
  IUserCredits,
} from "../../src/db/model"; // Import the actual path
import { InvalidOrderError } from "../../src/errors";
import { BaseService } from "../../src/service/BaseService"; //IMPROVEMENT Should use { IPayment } and add a secondary interface instead
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import { toHaveSameFields } from "../extend/sameObjects";
import { initMocks, newObjectId, ObjectId } from "./mocks/BaseService.mocks";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";
import { prefillOrdersForTests, TEST_USER_IDS } from "../db/mongoose/mocks/step2_ExecuteOrders";
import { prefillOffersForTests } from "../db/mongoose/mocks/step1_PrepareLoadOffers";

class ExtendedBaseService<K extends IMinimalId> extends BaseService<K> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterExecute(order: IOrder<K>): Promise<IUserCredits<K>> {
    return Promise.resolve(undefined as unknown as IUserCredits<K>);
  }
}

describe("createOrder: verifying createOrder works before relying on it for other tests", () => {
  // eslint-disable-next-line
  type OffersToTest = { free: Partial<IOffer<ObjectId>>, enterpriseM: Partial<IOffer<ObjectId>>, vipSeoBackLinks_1_article: Partial<IOffer<ObjectId>>};
  type PrefillResult = { allOffer: OffersToTest };

  let service: BaseService<ObjectId>;
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let allOffers: OffersToTest;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({ mongooseDaoFactory } = mocks);
    service = new ExtendedBaseService(mongooseDaoFactory);
    ({ allOffers } = await prefillOffersForTests(service.getDaoFactory())) as unknown as PrefillResult;
  });

  it("should create an order with the specified quantity and total", async () => {
    // Arrange
    const enterpriseM = allOffers.enterpriseM;
    const offerId = enterpriseM._id; // Use the offer with a quantity limit
    const userId = newObjectId();
    const quantity = 3; // Below the maximum allowed quantity

    if( !offerId )
      throw new Error("Offer was not created: enterpriseM")
    // Act
    const order = await service.createOrder(offerId, userId, quantity);

    // Assert
    expect(order.quantity).toEqual(quantity);
    expect(order.total).toEqual(order.quantity * enterpriseM.price!);
  });

  it("should throw an InvalidOrderError when quantity exceeds the maximum limit", async () => {
    // Arrange
    const offerId = allOffers.free._id; // Use the offer with a quantity limit
    const userId = newObjectId();
    const quantity = 2; // Exceeds the maximum allowed quantity

    // Act
    try {
      await service.createOrder(offerId!, userId, quantity);
    } catch (error) {
      // Assert
      expect(error).toBeInstanceOf(InvalidOrderError);
      expect((error as InvalidOrderError).message).toBe(
        "Requested quantity exceeds the limit",
      );
      return; // Exit the test function
    }

    // If no error was thrown, fail the test
    fail("Expected InvalidOrderError to be thrown");
  });
  it("should create an order with quantity undefined and price == offer.price if quantity parameter is not provided", async () => {
    // Arrange
    const enterpriseM = allOffers.enterpriseM;
    const offerId = enterpriseM._id;
    const userId = newObjectId();

    // Act
    const order = await service.createOrder(offerId!, userId);

    // Assert
    expect(order.quantity).toBeUndefined();
    expect(order.total).toEqual(enterpriseM.price);
  });

  // FIXME should add an offer with kind tokens
  // it("should create an order with tokenCount when the offer kind is 'tokens'", async () => {
  //   // Arrange
  //   const offerId = offerRoot1._id; // Use the tokens offer
  //   const userId = sampleUserId;
  //   const quantity = 5; // Any quantity, as this test focuses on tokenCount
  //
  //   // Act
  //   const order = await service.createOrder(offerId, userId, quantity);
  //
  //   // Assert
  //   expect(order.tokenCount).toEqual(offerRoot1.tokenCount);
  // });
  //
  // it("unimplemented feature: should refuse to create an order if it is not unlocked (and the control option enabled)", async () => {
  //   // Arrange
  //   const offerId = allOffers.vipSeoBackLinks_1_article._id; // Use an offer with quantity limit
  //   const userId = newObjectId();
  //
  //   try {
  //     // Act
  //     await service.createOrder(offerId!, userId, {onlyIfUnlocked: true});
  //   } catch (error) {
  //     // Assert
  //     expect(error).toBeInstanceOf(InvalidOrderError);
  //     expect((error as InvalidOrderError).message).toBe(
  //       "Conditional offer locked: user is not allowed for this order.",
  //     );
  //     return; // Exit the test function
  //   }
  //
  //   // If no error was thrown, fail the test
  //   fail("Expected InvalidOrderError to be thrown");
  // });
});

describe("Offer Database Integration Test", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let service: BaseService<ObjectId>;
  let mongoMemoryServer: MongoMemoryServer;
  let connection: Connection;
  let orderDao: IOrderDao<ObjectId, IOrder<ObjectId>>

  beforeEach(async () => {
    // Initialize your mocks and dependencies here.
    ({
      connection,
      mongoMemoryServer,
      mongooseDaoFactory,
    } = await initMocks(false));

    orderDao = mongooseDaoFactory.getOrderDao();
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new ExtendedBaseService<ObjectId>(mongooseDaoFactory);
    await prefillOrdersForTests(service);
  });

  afterEach(async () => {
    await mongoMemoryServer.stop(false);
    await connection.close();
  });

  it("should have inserted all orders in prefillOrdersForTests", async () => {
    const orders = await orderDao.find({});
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.map( (order: IOrder<ObjectId>) => order.offerGroup )).toEqual(
      expect.arrayContaining([
        // Free is only once, but the others are twice each: monthly and yearly
        "Free",
        "Startup",
        "ScaleUp",
        "EbEnterprise",
        "VipEventTalk",
      ]),
    );
    expect(orders.length).toBe(5);

    const userCerditsDao = mongooseDaoFactory.getUserCreditsDao();
    const userCreditsInserted = await userCerditsDao.find({} );
    expect(Array.isArray(userCreditsInserted)).toBe(true);
    expect(userCreditsInserted.length).toBe(4);
  });

  it("should correctly override offers with unlocked offers", async () => {

  });

  it("should forbid a user to purchase an offer he didn't unlock", async () => {
  });

  it("should override offers between two active subscriptions, taking the ones with higher weights", async () => {

  });
})

// describe("BaseService.getActiveSubscriptions", () => {
//   let daoFactoryMock: IDaoFactory<ObjectId>;
//   let sampleUserId: ObjectId;
//   let subscriptionPaidRoot1: ISubscription<ObjectId>;
//   let subscriptionPendingChild3_1: ISubscription<ObjectId>;
//   let subscriptionRefusedChild3_2: ISubscription<ObjectId>;
//   let sampleUserCredits: IUserCredits<ObjectId>;
//
//   beforeAll(async () => {
//     // Initialize your mocks and dependencies here.
//     const mocks = await initMocks();
//     ({
//       daoFactoryMock,
//       sampleUserId,
//       subscriptionPaidRoot1,
//       subscriptionPendingChild3_1,
//       subscriptionRefusedChild3_2,
//     } = mocks);
//     sampleUserCredits = {
//       subscriptions: [subscriptionPaidRoot1, subscriptionPendingChild3_1], // Use the created instances
//       tokens: 100, // Sample token balance
//       userId: sampleUserId,
//     } as unknown as IUserCredits<ObjectId>;
//   });
//
//   let service: BaseService<ObjectId>;
//
//   beforeEach(() => {
//     // Create a new instance of BaseService with the mock userCreditsDao
//     service = new ExtendedBaseService(daoFactoryMock);
//
//     // Reset the mock function before each test
//     (daoFactoryMock.getUserCreditsDao().findByUserId as jest.Mock).mockReset();
//   });
//
//   it("should return active subscriptions when user has paid subscriptions", async () => {
//     // Mock the userCreditsDao.findById method to return sampleUserCredits
//     (
//       daoFactoryMock.getUserCreditsDao().findByUserId as jest.Mock
//     ).mockResolvedValue(sampleUserCredits);
//
//     // Call the getActiveSubscriptions method
//     const activeSubscriptions =
//       await service.getActiveSubscriptions(sampleUserId);
//
//     // Assert that userCreditsDao.findById was called with the correct userId
//     expect(
//       daoFactoryMock.getUserCreditsDao().findByUserId,
//     ).toHaveBeenCalledWith(sampleUserId);
//
//     // Assert that activeSubscriptions contain only paid subscriptions
//     expect(activeSubscriptions).toEqual([
//       sampleUserCredits.subscriptions[0], // The first subscription is 'paid'
//     ]);
//   });
//
//   it("should return an empty array when user has no paid subscriptions", async () => {
//     // Modify the sampleUserCredits to have no paid subscriptions
//     const noPaidSubscriptionsUserCredits: IUserCredits<ObjectId> = {
//       ...sampleUserCredits,
//       subscriptions: [subscriptionPendingChild3_1, subscriptionRefusedChild3_2],
//     } as IUserCredits<ObjectId>;
//
//     // Mock the userCreditsDao.findById method to return the modified userCredits
//     (
//       daoFactoryMock.getUserCreditsDao().findByUserId as jest.Mock
//     ).mockResolvedValue(noPaidSubscriptionsUserCredits);
//
//     // Call the getActiveSubscriptions method
//     const activeSubscriptions =
//       await service.getActiveSubscriptions(sampleUserId);
//
//     // Assert that userCreditsDao.findById was called with the correct userId
//     expect(
//       daoFactoryMock.getUserCreditsDao().findByUserId,
//     ).toHaveBeenCalledWith(sampleUserId);
//
//     // Assert that activeSubscriptions is an empty array
//     expect(activeSubscriptions).toEqual([]);
//   });
// });

// describe("MergeOffers tests", () => {
//   let offerChild1: IOffer<ObjectId>;
//   let offerChild2: IOffer<ObjectId>;
//   let offerRoot1: IOffer<ObjectId>;
//   let offerRoot2: IOffer<ObjectId>;
//   let service: BaseService<ObjectId>;
//   let daoFactoryMock: IDaoFactory<ObjectId>;
//
//   beforeAll(async () => {
//     // Initialize your mocks and dependencies here.
//     const mocks = await initMocks();
//     ({ daoFactoryMock, offerChild1, offerChild2, offerRoot1, offerRoot2 } =
//       mocks);
//
//     service = new ExtendedBaseService(daoFactoryMock);
//   });
//
//   it("should merge sub-offers that match overridingKey with root offers", () => {
//     const mergedOffers = service.mergeOffers(
//       [offerRoot1, offerRoot2],
//       [offerChild1, offerChild2],
//     );
//     expect(mergedOffers).toEqual(
//       expect.arrayContaining([offerRoot2, offerChild1, offerChild2]),
//     );
//   });
//   it("should return a union array if no key matches are found", () => {
//     const mergedOffers = service.mergeOffers([offerRoot1], [offerChild1]);
//     expect(mergedOffers).toEqual(
//       expect.arrayContaining([offerRoot1, offerChild1]),
//     );
//   });
//
//   it("should handle empty input arrays", () => {
//     const mergedOffers = service.mergeOffers([], []);
//     expect(mergedOffers).toEqual([]);
//   });
// });

;
