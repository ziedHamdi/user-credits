//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import {
  addDays,
  addMonths,
  addSeconds,
  IDaoFactory,
  IMinimalId,
  IOffer,
  IOrder,
  IOrderDao,
  ITokenTimetable,
  IUserCredits,
} from "@user-credits/core"; // Import the actual path
import {
  BaseService,
  InvalidOrderError,
  PaymentService,
} from "@user-credits/core"; // Import the actual path
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";

import {
  OFFER_GROUP,
  prefillOffersForTests,
} from "../db/mongoose/mocks/step1_PrepareLoadOffers";
import {
  prefillOrdersForTests,
  USER_ORDERS,
} from "../db/mongoose/mocks/step2_ExecuteOrders";
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import { toHaveSameFields } from "../extend/sameObjects";
import { initMocks, newObjectId, ObjectId } from "./mocks/BaseService.mocks";
import { StripeMock } from "./mocks/StripeMock";

class ExtendedBaseService<K extends IMinimalId> extends BaseService<K> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterExecute(order: IOrder<K>): Promise<IUserCredits<K>> {
    return Promise.resolve(undefined as unknown as IUserCredits<K>);
  }

  async computeStartDate(order: IOrder<K>) {
    return await super.computeStartDate(order);
  }

  payOrder = jest.fn();
}

describe("computeStartDate", () => {
  let service;
  const baseDao = () => {
    return {
      find: jest.fn(),
      findById: jest.fn(),
    };
  };
  const daos = {
    offerDao: baseDao(),
    orderDao: baseDao(),
    tokenTimetableDao: baseDao(),
    userCreditsDao: baseDao(),
  };
  const daoFactory = {
    getOfferDao: () => daos.offerDao,
    getOrderDao: () => daos.orderDao,
    getTokenTimetableDao: () => daos.tokenTimetableDao,
    getUserCreditsDao: () => daos.userCreditsDao,
  } as unknown as IDaoFactory<K>;
  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    // const mocks = await initMocks();
    // ({ mongooseDaoFactory } = mocks);

    service = new ExtendedBaseService(daoFactory);
    // ({ allOffers } = await prefillOffersForTests(
    //   service.getDaoFactory(),
    // )) as unknown as PrefillResult;
  });
  it("should not change startDate if already set", async () => {
    // Arrange
    const order = {
      _id: "someId",
      starts: addSeconds(new Date(), 10) /* other fields */,
    };

    // Act
    await service.computeStartDate(order);

    // Assert
    expect(order.starts).toBeDefined();
    // Ensure order.starts remains the same
  });

  it("should set startDate to current date if no existing paid orders", async () => {
    // Arrange
    const order = {
      _id: "someId",
      offerGroup: "someOfferGroup",
      starts: undefined /* other fields */,
    };
    daos.orderDao.find.mockResolvedValue([]);

    // Act
    const start = await service.computeStartDate(order);

    // Assert
    expect(start).toBeDefined();
    // Ensure order.starts is set to the current date
  });

  it("should set startDate to the latest expires date of existing paid orders", async () => {
    // Arrange
    const existingOrders = [
      { expires: new Date("2050-01-01") },
      { expires: new Date("2050-12-01") },
      { expires: new Date("2023-12-02") },
      { expires: new Date("2020-01-01") },
      // Add more orders with different expires dates
    ];
    daos.orderDao.find.mockResolvedValue(existingOrders);
    daos.offerDao.findById.mockResolvedValue({ appendDate: true });
    const order = {
      _id: "someId",
      offerGroup: "someOfferGroup",
      starts: undefined,
    };

    // Act
    const starts = await service.computeStartDate(order);

    // Assert
    expect(starts).toEqual(new Date("2050-12-01"));
    // Ensure order.starts is set to the latest expires date among existing paid orders
  });
});

/**
 * This file is now testing MongoDb adapter (mongooseDaoFactory) only, but the same test should run on any implementation.
 * Multiple Awilix configurations will enable switching between the different implementation.
 * Check /test/testContainer.ts for IOC configuration details
 */
describe("createOrder: verifying createOrder works before relying on it for other tests", () => {
  // eslint-disable-next-line
  type OffersToTest = { free: Partial<IOffer<ObjectId>>, enterpriseM: Partial<IOffer<ObjectId>>, vipSeoBackLinks_1_article: Partial<IOffer<ObjectId>> };
  type PrefillResult = { allOffer: OffersToTest };

  let service: BaseService<ObjectId>;
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let allOffers: OffersToTest;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({ mongooseDaoFactory } = mocks);
    service = new ExtendedBaseService(mongooseDaoFactory);
    ({ allOffers } = await prefillOffersForTests(
      service.getDaoFactory(),
    )) as unknown as PrefillResult;
  });

  it("should create an order with the specified quantity and total", async () => {
    // Arrange
    const enterpriseM = allOffers.enterpriseM;
    const offerId = enterpriseM._id; // Use the offer with a quantity limit
    const userId = newObjectId();
    const quantity = 3; // Below the maximum allowed quantity

    if (!offerId) throw new Error("Offer was not created: enterpriseM");
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
  let orderDao: IOrderDao<ObjectId, IOrder<ObjectId>>;

  beforeEach(async () => {
    // Initialize your mocks and dependencies here.
    ({ connection, mongoMemoryServer, mongooseDaoFactory } =
      await initMocks(false));

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
    expect(orders.map((order: IOrder<ObjectId>) => order.offerGroup)).toEqual(
      expect.arrayContaining([
        // Free is only once, but the others are twice each: monthly and yearly
        "Free",
        "Startup",
        "ScaleUp",
        "EbEnterprise",
        "AiTokens",
      ]),
    );
    expect(orders.length).toBe(5);

    const userCerditsDao = mongooseDaoFactory.getUserCreditsDao();
    const userCreditsInserted = await userCerditsDao.find({});
    expect(Array.isArray(userCreditsInserted)).toBe(true);
    expect(userCreditsInserted.length).toBe(4);
  });

  it("should load aggregates from token time table", async () => {
    const tokenTimetableDao = mongooseDaoFactory.getTokenTimetableDao();
    const userId = newObjectId();
    const now = new Date();
    const ago3Months = addMonths(now, -3);
    const ago2Months = addMonths(now, -2);
    const ago1Month = addMonths(now, -1);
    const ago3Weeks = addDays(now, -21);
    const ago2Weeks = addDays(now, -14);
    const ago1Week = addDays(now, -7);
    /* eslint-disable prettier/prettier */
    await tokenTimetableDao.create( {createdAt:ago3Months, offerGroup:"G1", tokens:100, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago3Months, offerGroup:"G1", tokens:-1, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago2Months, offerGroup:"G1", tokens:-2, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago1Month, offerGroup:"G1", tokens:-3, userId} as ITokenTimetable<ObjectId> )

    await tokenTimetableDao.create( {createdAt:ago3Weeks, offerGroup:"G1", tokens:-4, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago2Weeks, offerGroup:"G1", tokens:-5, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago1Week, offerGroup:"G1", tokens:-6, userId} as ITokenTimetable<ObjectId> )

    await tokenTimetableDao.create( {createdAt:ago3Months, offerGroup:"G2", tokens:200, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago3Months, offerGroup:"G2", tokens:-1, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago2Months, offerGroup:"G2", tokens:2, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago1Month, offerGroup:"G2", tokens:-3, userId} as ITokenTimetable<ObjectId> )

    await tokenTimetableDao.create( {createdAt:ago3Weeks, offerGroup:"G2", tokens:5, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago2Weeks, offerGroup:"G2", tokens:-8, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago1Week, offerGroup:"G2", tokens:13, userId} as ITokenTimetable<ObjectId> )

    const compareFn = (a, b) => a._id.localeCompare(b._id);
    const consumptionPerOfferGroups = (await tokenTimetableDao.checkTokens(ago3Months, now)).sort(compareFn);
    const consumptionPerOfferGroupsShort = (await tokenTimetableDao.checkTokens(ago3Months, ago3Weeks)).sort(compareFn);
    const consumptionPerOfferGroupsAll = (await tokenTimetableDao.checkTokens(ago3Months, now, false)).sort(compareFn);
    const consumptionPerOfferGroupsShortAll = (await tokenTimetableDao.checkTokens(ago3Months, ago3Weeks, false)).sort(compareFn);

    // Assert
    expect(Array.isArray(consumptionPerOfferGroups)).toBe(true);
    expect(consumptionPerOfferGroups.length).toBe(2);
    expect(consumptionPerOfferGroups[0]._id).toBe("G1");
    expect(consumptionPerOfferGroups[0].totalTokens).toBe(-21);

    expect(consumptionPerOfferGroups[1]._id).toBe("G2");
    expect(consumptionPerOfferGroups[1].totalTokens).toBe(-12);

    expect(consumptionPerOfferGroupsShort[0]._id).toBe("G1");
    expect(consumptionPerOfferGroupsShort[0].totalTokens).toBe(-6);

    expect(consumptionPerOfferGroupsShort[1]._id).toBe("G2");
    expect(consumptionPerOfferGroupsShort[1].totalTokens).toBe(-4);

    expect(consumptionPerOfferGroupsAll[0]._id).toBe("G1");
    expect(consumptionPerOfferGroupsAll[0].totalTokens).toBe(79);

    expect(consumptionPerOfferGroupsAll[1]._id).toBe("G2");
    expect(consumptionPerOfferGroupsAll[1].totalTokens).toBe(208);

    expect(consumptionPerOfferGroupsShortAll[0]._id).toBe("G1");
    expect(consumptionPerOfferGroupsShortAll[0].totalTokens).toBe(94);

    expect(consumptionPerOfferGroupsShortAll[1]._id).toBe("G2");
    expect(consumptionPerOfferGroupsShortAll[1].totalTokens).toBe(198);
    /* eslint-enable prettier/prettier */
  });
  it("should sum negative token time table", async () => {
    const tokenTimetableDao = mongooseDaoFactory.getTokenTimetableDao();
    const userId = newObjectId();
    const now = new Date();
    const ago3Months = addMonths(now, -3);
    const ago2Months = addMonths(now, -2);
    const ago1Month = addMonths(now, -1);
    const ago3Weeks = addDays(now, -21);
    const ago2Weeks = addDays(now, -14);
    const ago1Week = addDays(now, -7);
    /* eslint-disable prettier/prettier */
    await tokenTimetableDao.create( {createdAt:ago3Months, offerGroup:"G1", tokens:100, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago3Months, offerGroup:"G1", tokens:-1, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago2Months, offerGroup:"G1", tokens:-2, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago1Month, offerGroup:"G1", tokens:-3, userId} as ITokenTimetable<ObjectId> )

    await tokenTimetableDao.create( {createdAt:ago3Weeks, offerGroup:"G1", tokens:-4, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago2Weeks, offerGroup:"G1", tokens:-5, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago1Week, offerGroup:"G1", tokens:-6, userId} as ITokenTimetable<ObjectId> )

    await tokenTimetableDao.create( {createdAt:ago3Months, offerGroup:"G2", tokens:200, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago3Months, offerGroup:"G2", tokens:-1, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago2Months, offerGroup:"G2", tokens:2, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago1Month, offerGroup:"G2", tokens:-3, userId} as ITokenTimetable<ObjectId> )

    await tokenTimetableDao.create( {createdAt:ago3Weeks, offerGroup:"G2", tokens:-5, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago2Weeks, offerGroup:"G2", tokens:-8, userId} as ITokenTimetable<ObjectId> )
    await tokenTimetableDao.create( {createdAt:ago1Week, offerGroup:"G2", tokens:13, userId} as ITokenTimetable<ObjectId> )

    const consumptionPerOfferGroups1 = (await tokenTimetableDao.consumptionInDateRange("G1", ago3Months, now));
    const consumptionPerOfferGroups1Short = (await tokenTimetableDao.consumptionInDateRange("G1", ago3Months, ago3Weeks));
    const consumptionPerOfferGroups2 = (await tokenTimetableDao.consumptionInDateRange("G2", ago3Months, now));
    const consumptionPerOfferGroups2Short = (await tokenTimetableDao.consumptionInDateRange("G2", ago3Months, ago3Weeks));

    // Assert
    expect(consumptionPerOfferGroups1).toBe(-21);
    expect(consumptionPerOfferGroups2).toBe(-17);

    expect(consumptionPerOfferGroups1Short).toBe(-6);
    expect(consumptionPerOfferGroups2Short).toBe(-4);

    /* eslint-enable prettier/prettier */
  });

  // TODO should correctly override offers with unlocked offers
  // it("should correctly override offers with unlocked offers", async () => {});

  // TODO should forbid a user to purchase an offer he didn't unlock
  // it("should forbid a user to purchase an offer he didn't unlock", async () => {});

  // TODO should override offers between two active subscriptions, taking the ones with higher weights
  // it("should override offers between two active subscriptions, taking the ones with higher weights", async () => {});
});

describe("BaseService.getActiveSubscriptions", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let mongoMemoryServer: MongoMemoryServer;
  let connection: Connection;
  const paymentClientMock = new StripeMock<ObjectId>();
  const sampleUserId = USER_ORDERS.User_Eb_Enterprise.userId;
  let service: PaymentService<ObjectId>;

  beforeEach(async () => {
    const mocks = await initMocks(false);
    ({ connection, mongoMemoryServer, mongooseDaoFactory } = mocks);
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new PaymentService<ObjectId>(
      mongooseDaoFactory,
      paymentClientMock,
      "usd",
    );
    await prefillOrdersForTests(service);
  }, 1000 * 60);

  afterEach(async () => {
    await mongoMemoryServer.stop(false);
    await connection.close();
  });
  it("should return no active subscriptions as user has not paid yet", async () => {
    // Create a spy on the real findByUserId method
    const findByUserIdSpy = jest.spyOn(
      mongooseDaoFactory.getUserCreditsDao(),
      "findByUserId",
    );

    // Call the getActiveSubscriptions method
    const activeSubscriptions =
      await service.getActiveSubscriptions(sampleUserId);

    // Assert that findByUserId was called with the correct userId (the user must be loaded from storage)
    expect(findByUserIdSpy).toHaveBeenCalled();
    expect(findByUserIdSpy).toHaveBeenCalledWith(sampleUserId);

    // Assert that activeSubscriptions contain only paid subscriptions
    expect(Array.isArray(activeSubscriptions)).toEqual(true);
    expect(activeSubscriptions.length).toEqual(0);
  });
  it("should have two pending subscriptions for EbEnterprise", async () => {
    // Create a spy on the real findByUserId method
    const userCredits = await service.loadUserCredits(sampleUserId);

    // Assert that activeSubscriptions contain only paid subscriptions
    expect(Array.isArray(userCredits.subscriptions)).toEqual(true);
    const ebEnterprise = userCredits.subscriptions.find(
      (subs) => subs.offerGroup == OFFER_GROUP.EbEnterprise,
    );
    expect(ebEnterprise).toBeTruthy();
    expect(ebEnterprise!.status).toEqual("pending");
    expect(ebEnterprise!.offerId).toBeTruthy();
    const aiTokens = userCredits.subscriptions.find(
      (subs) => subs.offerGroup == OFFER_GROUP.AiTokens,
    );
    expect(aiTokens).toBeTruthy();
    expect(aiTokens!.status).toEqual("pending");
    expect(aiTokens!.offerId).toBeTruthy();
  });
  it("should throw error if afterExecute is called with an unknown subscription (without createOrder being called previously)", async () => {
    const paidOrder = {
      _id: newObjectId(),
      cycle: "monthly",
      markModified: jest.fn(),
      orderId: newObjectId(),
      status: "paid",
      userId: sampleUserId,
    } as unknown as IOrder<ObjectId>;
    try {
      // Act: The real implementation would check if the order was really paid, we're using {@link StripeMock} here to bypass that
      await service.afterExecute({ ...paidOrder, status: "pending" }); // a paid status would be interpreted as an already paid order and throw an exception
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidOrderError);
      expect((error as InvalidOrderError).message).toMatch("Offer with id ");
      return; // Exit the test function
    }

    // If no error was thrown, fail the test
    fail("Expected InvalidOrderError to be thrown");
  });
  it(
    "should insert suborders on afterExecute with a 'paid' order status",
    async () => {
      let userCredits = await service.loadUserCredits(sampleUserId);
      let ebEnterprise = userCredits.subscriptions.find(
        (subs) => subs.offerGroup == OFFER_GROUP.EbEnterprise,
      );
      const orderId = ebEnterprise!.orderId;
      const paidOrder = {
        _id: orderId,
        cycle: "monthly",
        markModified: jest.fn(),
        offerGroup: "GT1",
        offerId: ebEnterprise.offerId,
        orderId: orderId,
        save: jest.fn(),
        status: "paid",
        total: 1,
        userId: sampleUserId,
      } as unknown as IOrder<ObjectId>;

      //The Mock emulates a check that the order is really paid in the payment system, and returns an order with an updated status
      // eslint-disable-next-line
    (paymentClientMock.afterPaymentExecuted = jest.fn()).mockResolvedValue(paidOrder);

      // Act: The real implementation would check if the order was really paid, we're using {@link StripeMock} here to bypass that
      await service.afterExecute({ ...paidOrder, status: "pending" }); // a paid status would be interpreted as an already paid order and throw an exception

      // Assert
      // const order = await service
      //   .getDaoFactory()
      //   .getOrderDao()
      //   .findById(orderId);

      userCredits = await service.loadUserCredits(sampleUserId);
      ebEnterprise = userCredits.subscriptions.find(
        (subs) => subs.offerGroup == OFFER_GROUP.EbEnterprise,
      );

      // Assert that activeSubscriptions contain only paid subscriptions
      expect(ebEnterprise!.status).toEqual("paid");
      expect(ebEnterprise!.tokens).toEqual(1800);
      const aiTokens = userCredits.subscriptions.find(
        (subs) => subs.offerGroup == OFFER_GROUP.AiTokens,
      );

      // Assert that activeSubscriptions contain only paid subscriptions
      expect(aiTokens!.status).toEqual("paid");
      expect(aiTokens!.tokens).toEqual(28 * 300);
    },
    1000 * 60,
  );
  it("should update subscriptions on afterExecute with a 'paid' order status", async () => {
    let userCredits = await service.loadUserCredits(sampleUserId);
    let ebEnterprise = userCredits.subscriptions.find(
      (subs) => subs.offerGroup == OFFER_GROUP.EbEnterprise,
    );
    const paidOrder = {
      _id: ebEnterprise!.orderId,
      cycle: "monthly",
      markModified: jest.fn(),
      offerGroup: "GT1",
      offerId: ebEnterprise!.offerId,
      orderId: ebEnterprise!.orderId,
      save: jest.fn(),
      status: "paid",
      userId: sampleUserId,
    } as unknown as IOrder<ObjectId>;

    //The Mock emulates a check that the order is really paid in the payment system, and returns an order with an updated status
    // eslint-disable-next-line
    (paymentClientMock.afterPaymentExecuted = jest.fn()).mockResolvedValue(paidOrder);

    // Act: The real implementation would check if the order was really paid, we're using {@link StripeMock} here to bypass that
    await service.afterExecute({ ...paidOrder, status: "pending" }); // a paid status would be interpreted as an already paid order and throw an exception

    // Assert
    userCredits = await service.loadUserCredits(sampleUserId);
    ebEnterprise = userCredits.subscriptions.find(
      (subs) => subs.offerGroup == OFFER_GROUP.EbEnterprise,
    );

    // Assert that activeSubscriptions contain only paid subscriptions
    expect(ebEnterprise!.status).toEqual("paid");
  });
});

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
