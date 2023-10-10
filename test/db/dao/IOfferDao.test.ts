//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
import { afterAll, afterEach, beforeAll, describe, it } from "@jest/globals";
import expect from "expect";

import { IDaoFactory } from "../../../src/db/dao";
import { IOffer, ISubscription, IUserCredits } from "../../../src/db/model";
import { BaseService } from "../../../src/service/BaseService";
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import { toHaveSameFields } from "../../extend/sameObjects";
import {
  initMocks,
  InitMocksResult,
  newObjectId,
  ObjectId,
} from "../../service/mocks/BaseService.mocks";
import { addVersion0, clearDatabase, copyId } from "../../extend/util";

/**
 * This file is now testing MongoDb adapter (mongooseDaoFactory) only, but the same test should run on any implementation.
 * Multiple Awilix configurations will enable switching between the different implementation.
 * Check /test/testContainer.ts for IOC configuration details
 */
describe("offer creation", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let offerRoot1: IOffer<ObjectId>;
  let service: BaseService<ObjectId>;
  beforeAll(async () => {
    // Initialize mocks and dependencies here.
    const mocks = await initMocks();
    ({ mongooseDaoFactory, offerRoot1 } = mocks);
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new BaseService<ObjectId>(mongooseDaoFactory);
  });

  afterAll(clearDatabase);

  it("should create offer then retrieve it", async () => {
    const offerDao = service.getDaoFactory().getOfferDao();
    const createdOffer = await offerDao.create(offerRoot1);

    // Expect that the createdOffer is not null
    expect(createdOffer).toBeTruthy();

    // Retrieve the offer by its ID
    const retrievedOffer = await offerDao.findById(createdOffer._id);

    // Expect that the retrievedOffer is not null and has the same properties as the sampleOffer
    expect(retrievedOffer).toBeTruthy();
    expect(retrievedOffer).toEqual(createdOffer);
  });
});

async function insertOffers(
  service: BaseService<ObjectId>,
  offerRoot1: IOffer<ObjectId>,
  offerRoot2: IOffer<ObjectId>,
  offerRoot3: IOffer<ObjectId>,
  offerChild1: IOffer<ObjectId>,
  offerChild2: IOffer<ObjectId>,
  offerChild3_1: IOffer<ObjectId>,
  offerChild3_2: IOffer<ObjectId>,
) {
  const offerDao = service.getDaoFactory().getOfferDao();
  const createdOffer1 = await offerDao.create(offerRoot1);
  const createdOffer2 = await offerDao.create(offerRoot2);
  const createdOffer3 = await offerDao.create(offerRoot3);
  const createdChild1 = await offerDao.create(offerChild1);
  const createdChild2 = await offerDao.create(offerChild2);
  const createdChild3_1 = await offerDao.create(offerChild3_1);
  const createdChild3_2 = await offerDao.create(offerChild3_2);
  return {
    createdChild1,
    createdChild2,
    createdChild3_1,
    createdChild3_2,
    createdOffer1,
    createdOffer2,
    createdOffer3,
  };
}

describe("Offer Database Integration Test", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let offerRoot1: IOffer<ObjectId>;
  let offerRoot2: IOffer<ObjectId>;
  let offerRoot3: IOffer<ObjectId>;
  let offerChild1: IOffer<ObjectId>;
  let offerChild2: IOffer<ObjectId>;
  let offerChild3_1: IOffer<ObjectId>;
  let offerChild3_2: IOffer<ObjectId>;
  let service: BaseService<ObjectId>;
  let subscriptionPaid1: ISubscription<ObjectId>;
  let subscriptionPaid2: ISubscription<ObjectId>;
  let subscriptionPending1: ISubscription<ObjectId>;
  let subscriptionRefused1: ISubscription<ObjectId>;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks: InitMocksResult = await initMocks();
    ({
      mongooseDaoFactory,
      offerChild1,
      offerChild2,
      offerChild3_1,
      offerChild3_2,
      offerRoot1,
      offerRoot2,
      offerRoot3,
      subscriptionPaid1,
      subscriptionPaid2,
      subscriptionPending1,
      subscriptionRefused1,
    } = mocks);

    // Use the actual MongoDB connection for the service
    service = new BaseService<ObjectId>(mongooseDaoFactory);
  });

  afterEach(clearDatabase);

  it("should insert all offers and retrieve only root offers from the database for a null userId", async () => {
    const { createdOffer1, createdOffer2, createdOffer3 } = await insertOffers(
      service,
      offerRoot1,
      offerRoot2,
      offerRoot3,
      offerChild1,
      offerChild2,
      offerChild3_1,
      offerChild3_2,
    );

    const userId = null;
    const loadedOffers = await service.loadOffers(userId);

    // Expect that loadedOffers contain the created offers, including suboffers
    expect(loadedOffers).toContainEqual(createdOffer1);
    expect(loadedOffers).toContainEqual(createdOffer2);
    expect(loadedOffers).toContainEqual(createdOffer3);
    expect(loadedOffers.length).toEqual(3);
  });

  it("should correctly override conflicting offers", async () => {
    await insertOffers(
      service,
      offerRoot1,
      offerRoot2,
      offerRoot3,
      offerChild1,
      offerChild2,
      offerChild3_1,
      offerChild3_2,
    );

    // Create active and unpaid subscriptions

    const userId = newObjectId();
    // Create the userCredits document with active and unpaid subscriptions
    const userCredits: IUserCredits<ObjectId> = {
      subscriptions: [
        subscriptionPaid1,
        subscriptionPending1,
        subscriptionRefused1,
      ],
      tokens: 100,
      userId,
    } as IUserCredits<ObjectId>;

    const createdUserCredits: IUserCredits<ObjectId> = await service
      .getDaoFactory()
      .getUserCreditsDao()
      .create(userCredits);

    // Test the first step: Get active subscriptions
    const step1ActiveSubscriptions = await service.getActiveSubscriptions(
      createdUserCredits.userId,
    );

    copyId(step1ActiveSubscriptions[0], subscriptionPaid1);
    // Expect that step1ActiveSubscriptions contain the active subscription
    expect(step1ActiveSubscriptions).toContainEqual(subscriptionPaid1);

    // Test the second step: Get subOffers based on active subscriptions
    const step2SubOffers = await service.getSubOffers(step1ActiveSubscriptions);

    // Expect that step2SubOffers contain the created suboffers
    expect(step2SubOffers).toContainEqual(addVersion0(offerChild1));
    expect(step2SubOffers).toContainEqual(addVersion0(offerChild2));
    expect(step2SubOffers.length).toEqual(2);

    // Test the third step: Get regular offers
    const step3RegularOffers = await service.getRegularOffers();

    // Expect that step3RegularOffers contain the root offers
    expect(step3RegularOffers).toContainEqual(addVersion0(offerRoot1));
    expect(step3RegularOffers).toContainEqual(addVersion0(offerRoot2));
    expect(step3RegularOffers.length).toEqual(3);

    //All the steps above + merge
    const loadedOffers = await service.loadOffers(createdUserCredits.userId);
    // Expect that loadedOffers contain the created root offers
    expect(loadedOffers).not.toContainEqual(addVersion0(offerRoot1));
    expect(loadedOffers).toContainEqual(addVersion0(offerRoot2));
    expect(loadedOffers).toContainEqual(addVersion0(offerRoot3));
    // Expect that loadedOffers do not contain unpaid suboffers but contain active suboffers
    expect(loadedOffers).toContainEqual(addVersion0(offerChild1));
    expect(loadedOffers).toContainEqual(addVersion0(offerChild2));
    expect(loadedOffers.length).toEqual(4);
  });

  it("should override offers between two active subscriptions, taking the ones with higher weights", async () => {
    await insertOffers(
      service,
      offerRoot1,
      offerRoot2,
      offerRoot3,
      offerChild1,
      offerChild2,
      offerChild3_1,
      offerChild3_2,
    );

    // Create active and unpaid subscriptions

    const userId = newObjectId();
    // Create the userCredits document with active and unpaid subscriptions
    const userCredits: IUserCredits<ObjectId> = {
      subscriptions: [
        subscriptionPaid1,
        subscriptionPaid2,
        subscriptionPending1,
        subscriptionRefused1,
      ],
      tokens: 100,
      userId,
    } as IUserCredits<ObjectId>;

    const createdUserCredits: IUserCredits<ObjectId> = await service
      .getDaoFactory()
      .getUserCreditsDao()
      .create(userCredits);

    // directly calls loadOffers(), to see details, check the test above this one
    const loadedOffers = await service.loadOffers(createdUserCredits.userId);
    // Expect that loadedOffers contain the created root offers
    expect(loadedOffers).not.toContainEqual(addVersion0(offerRoot1));
    expect(loadedOffers).toContainEqual(addVersion0(offerRoot2));
    expect(loadedOffers).toContainEqual(addVersion0(offerRoot3));
    // Expect that loadedOffers do not contain overridden sub-offers of rootOffer2
    expect(loadedOffers).not.toContainEqual(addVersion0(offerChild1));
    expect(loadedOffers).not.toContainEqual(addVersion0(offerChild2));
    expect(loadedOffers).toContainEqual(addVersion0(offerChild3_1));
    expect(loadedOffers).toContainEqual(addVersion0(offerChild3_2));
    expect(loadedOffers.length).toEqual(4);
  });
});
