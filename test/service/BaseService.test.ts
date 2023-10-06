import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import * as console from "console";

import { IDaoFactory } from "../../src/db/dao"; // Import the actual path
import {
  IOffer,
  IOrder,
  ISubscription,
  ITokenTimetable,
  IUserCredits,
} from "../../src/db/model"; // Import the actual path
import { BaseService } from "../../src/service/BaseService";
import { TestContainerSingleton } from "../testContainer";
import {toHaveSameFields} from "../extend/sameObjects"
import { expect, describe } from "@jest/globals";

function newObjectId(): ObjectId {
  return new Types.ObjectId();
}

type InitMocksResult = {
  daoFactoryMock: IDaoFactory<ObjectId>;
  dbUri: string;
  mongooseDaoFactory: IDaoFactory<ObjectId>;
  offerChild1: IOffer<ObjectId>;
  offerChild2: IOffer<ObjectId>;
  offerRoot1: IOffer<ObjectId>;
  offerRoot2: IOffer<ObjectId>;
  sampleUserId: ObjectId;
  subscriptionPaid1: ISubscription<ObjectId>;
  subscriptionPending1: ISubscription<ObjectId>;
  subscriptionRefused1: ISubscription<ObjectId>;
};

async function initMocks(): Promise<InitMocksResult> {
  const testContainer = await TestContainerSingleton.getInstance();
  // Sample data for testing
  const sampleUserId: ObjectId = testContainer.resolve("sampleUserId");

  const subscriptionPaid1: ISubscription<ObjectId> = {
    expires: new Date(),
    offerId: newObjectId(),
    starts: new Date(),
    status: "paid",
  } as ISubscription<ObjectId>;

  const subscriptionPending1: ISubscription<ObjectId> = {
    expires: new Date(),
    offerId: newObjectId(),
    starts: new Date(),
    status: "pending",
  } as ISubscription<ObjectId>;

  const subscriptionRefused1: ISubscription<ObjectId> = {
    expires: new Date(),
    offerId: newObjectId(),
    starts: new Date(),
    status: "refused",
  } as ISubscription<ObjectId>;

  const offerRoot1: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "100 tokens for 100$",
    overridingKey: "100tokens",
    parentOfferId: null as any, // To be updated below
    price: 100,
    tokenCount: 100,
  } as IOffer<ObjectId>;

  const offerRoot2: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "monthly",
    hasSubOffers: true, // This offer has sub-offers
    kind: "subscription",
    name: "Starter",
    overridingKey: "100tokens",
    parentOfferId: null as any, // To be updated below
    price: 50,
    tokenCount: 0,
  } as IOffer<ObjectId>;

  const offerChild1: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "20% off on 50 tokens",
    overridingKey: "50tokens",
    parentOfferId: offerRoot2._id, // is a sub-offer of Starter offer
    price: 40,
    tokenCount: 50,
  } as IOffer<ObjectId>;

  const offerChild2: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "30% off on 100 tokens",
    overridingKey: "100tokens",
    parentOfferId: offerRoot2._id, // is a sub-offer of Starter offer overrides the 100tokens offer
    price: 70,
    tokenCount: 100,
  } as IOffer<ObjectId>;

  const daoFactoryMock: IDaoFactory<ObjectId> =
    testContainer.resolve("daoFactoryMock");
  testContainer.resolve("mongoServer");
  const mongooseDaoFactory: IDaoFactory<ObjectId> =
    testContainer.resolve("mongooseDaoFactory");

  return {
    daoFactoryMock,
    dbUri: testContainer.resolve("dbUri"),
    mongooseDaoFactory,
    offerChild1,
    offerChild2,
    offerRoot1,
    offerRoot2,
    sampleUserId,
    subscriptionPaid1,
    subscriptionPending1,
    subscriptionRefused1,
  };
}

describe("BaseService.getActiveSubscriptions", () => {
  let daoFactoryMock: IDaoFactory<ObjectId>;
  let sampleUserId: ObjectId;
  let subscriptionPaid1: ISubscription<ObjectId>;
  let subscriptionPending1: ISubscription<ObjectId>;
  let subscriptionRefused1: ISubscription<ObjectId>;
  let sampleUserCredits: IUserCredits<ObjectId>;

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

  let service: BaseService<ObjectId>;

  beforeEach(() => {
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new BaseService<ObjectId>(daoFactoryMock);

    // Reset the mock function before each test
    (daoFactoryMock.getUserCreditsDao().findById as jest.Mock).mockReset();
  });

  it("should return active subscriptions when user has paid subscriptions", async () => {
    // Mock the userCreditsDao.findById method to return sampleUserCredits
    (
      daoFactoryMock.getUserCreditsDao().findById as jest.Mock
    ).mockResolvedValue(sampleUserCredits);

    // Call the getActiveSubscriptions method
    const activeSubscriptions =
      await service.getActiveSubscriptions(sampleUserId);

    // Assert that userCreditsDao.findById was called with the correct userId
    expect(daoFactoryMock.getUserCreditsDao().findById).toHaveBeenCalledWith(
      sampleUserId,
    );

    // Assert that activeSubscriptions contain only paid subscriptions
    expect(activeSubscriptions).toEqual([
      sampleUserCredits.subscriptions[0], // The first subscription is 'paid'
    ]);
  });

  it("should return an empty array when user has no paid subscriptions", async () => {
    // Modify the sampleUserCredits to have no paid subscriptions
    const noPaidSubscriptionsUserCredits: IUserCredits<ObjectId> = {
      ...sampleUserCredits,
      subscriptions: [subscriptionPending1, subscriptionRefused1],
    } as IUserCredits<ObjectId>;

    // Mock the userCreditsDao.findById method to return the modified userCredits
    (
      daoFactoryMock.getUserCreditsDao().findById as jest.Mock
    ).mockResolvedValue(noPaidSubscriptionsUserCredits);

    // Call the getActiveSubscriptions method
    const activeSubscriptions =
      await service.getActiveSubscriptions(sampleUserId);

    // Assert that userCreditsDao.findById was called with the correct userId
    expect(daoFactoryMock.getUserCreditsDao().findById).toHaveBeenCalledWith(
      sampleUserId,
    );

    // Assert that activeSubscriptions is an empty array
    expect(activeSubscriptions).toEqual([]);
  });
});

describe("mergeOffers tests", () => {
  let offerChild1: IOffer<ObjectId>;
  let offerChild2: IOffer<ObjectId>;
  let offerRoot1: IOffer<ObjectId>;
  let offerRoot2: IOffer<ObjectId>;
  let service: BaseService<ObjectId>;
  let daoFactoryMock: IDaoFactory<ObjectId>;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({ daoFactoryMock, offerChild1, offerChild2, offerRoot1, offerRoot2 } =
      mocks);

    service = new BaseService<ObjectId>(daoFactoryMock);
  });

  it("should merge sub-offers that match overridingKey with root offers", () => {
    const mergedOffers = service.mergeOffers(
      [offerRoot1, offerRoot2],
      [offerChild1, offerChild2],
    );
    expect(mergedOffers).toEqual(
      expect.arrayContaining([offerRoot2, offerChild1, offerChild2]),
    );
  });
  it("should return a union array if no key matches are found", () => {
    const mergedOffers = service.mergeOffers([offerRoot1], [offerChild1]);
    expect(mergedOffers).toEqual(
      expect.arrayContaining([offerRoot1, offerChild1]),
    );
  });

  it("should handle empty input arrays", () => {
    const mergedOffers = service.mergeOffers([], []);
    expect(mergedOffers).toEqual([]);
  });
});

describe("offer creation", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let offerRoot1: IOffer<ObjectId>;
  let service: BaseService<ObjectId>;
  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({ mongooseDaoFactory, offerRoot1 } = mocks);
  });
  beforeEach(() => {
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new BaseService<ObjectId>(mongooseDaoFactory);
  });

  it("should create offer then retrieve it", async () => {
    const offerDao = service.getDaoFactory().getOfferDao();
    const createdOffer = await offerDao.create(offerRoot1);

    // Expect that the createdOffer is not null
    expect(createdOffer).toBeTruthy();

    // Retrieve the offer by its ID
    const retrievedOffer = await offerDao.findById(createdOffer._id);

    // Expect that the retrievedOffer is not null and has the same properties as the sampleOffer
    expect(retrievedOffer).toBeTruthy();
    expect(retrievedOffer).toHaveSameFields(createdOffer);
    // expect(retrievedOffer?._id).toEqual(createdOffer._id);
    // expect(retrievedOffer?.cycle).toEqual(createdOffer.cycle);
    // expect(retrievedOffer?.kind).toEqual(createdOffer.kind);
  });
});
