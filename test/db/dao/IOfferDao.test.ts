//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
// FIXME references to ObjectID should be removed as this file is testing the interface IOfferDao not its implementation in mongoose
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@jest/globals";
import expect from "expect";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";

import { IDaoFactory } from "../../../src/db/dao";
import {
  IOffer,
  IOrder,
  ISubscription,
  IUserCredits,
  MinimalId,
} from "../../../src/db/model";
import { IActivatedOffer } from "../../../src/db/model/IUserCredits";
import { BaseService } from "../../../src/service/BaseService";
import { copyFieldsWhenMatching } from "../../../src/util/Copy";
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import { toHaveSameFields } from "../../extend/sameObjects";
import { addVersion0, clearDatabase, copyId } from "../../extend/util";
import {
  initMocks,
  newObjectId,
  ObjectId,
} from "../../service/mocks/BaseService.mocks";

class ExtendedBaseService<K extends MinimalId> extends BaseService<K> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterExecute(order: IOrder<K>): Promise<IUserCredits<K>> {
    return Promise.resolve(undefined as unknown as IUserCredits<K>);
  }
}

/**
 * This file is now testing MongoDb adapter (mongooseDaoFactory) only, but the same test should run on any implementation.
 * Multiple Awilix configurations will enable switching between the different implementation.
 * Check /test/testContainer.ts for IOC configuration details
 */
describe("offer creation", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let offerRoot1: IOffer<ObjectId>;
  let service: BaseService<ObjectId>;
  let mongoMemoryServer: MongoMemoryServer;
  let connection: Connection;

  beforeEach(async () => {
    // Initialize mocks and dependencies here.
    const mocks = await initMocks(false);
    ({ connection, mongoMemoryServer, mongooseDaoFactory, offerRoot1 } = mocks);
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new ExtendedBaseService<ObjectId>(mongooseDaoFactory);
  });

  afterEach(async () => {
    await mongoMemoryServer.stop(false);
    await connection.close();
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

function asRecord(offerChild1: IOffer<ObjectId>): Record<string, never> {
  return offerChild1 as unknown as Record<string, never>;
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
  let subscriptionPaidRoot1: ISubscription<ObjectId>;
  let subscriptionPaidRoot2: ISubscription<ObjectId>;
  let subscriptionPendingChild3_1: ISubscription<ObjectId>;
  let subscriptionRefusedChild3_2: ISubscription<ObjectId>;
  let mongoMemoryServer: MongoMemoryServer;
  let connection: Connection;

  beforeEach(async () => {
    // Initialize your mocks and dependencies here.
    ({
      connection,
      mongoMemoryServer,
      mongooseDaoFactory,
      offerChild1,
      offerChild2,
      offerChild3_1,
      offerChild3_2,
      offerRoot1,
      offerRoot2,
      offerRoot3,
      subscriptionPaidRoot1,
      subscriptionPaidRoot2,
      subscriptionPendingChild3_1,
      subscriptionRefusedChild3_2,
    } = await initMocks(false));

    // Create a new instance of BaseService with the mock userCreditsDao
    service = new ExtendedBaseService<ObjectId>(mongooseDaoFactory);
  });

  afterEach(async () => {
    await mongoMemoryServer.stop(false);
    await connection.close();
  });

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

    await clearDatabase();
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
      offers: [] as IActivatedOffer[],
      subscriptions: [
        subscriptionPaidRoot1,
        subscriptionPaidRoot2,
        subscriptionPendingChild3_1,
        subscriptionRefusedChild3_2,
      ],
      tokens: 100,
      userId,
    } as unknown as IUserCredits<ObjectId>;

    const createdUserCredits: IUserCredits<ObjectId> = await service
      .getDaoFactory()
      .getUserCreditsDao()
      .create(userCredits);

    // Test the first step: Get active subscriptions
    const step1ActiveSubscriptions = await service.getActiveSubscriptions(
      createdUserCredits.userId,
    );

    expect(step1ActiveSubscriptions.length).toEqual(2);
    copyFieldsWhenMatching(
      step1ActiveSubscriptions,
      [subscriptionPaidRoot1, subscriptionPaidRoot2],
      ["orderId"],
      ["_id"],
    );
    // Expect that step1ActiveSubscriptions contain the active subscription
    expect(step1ActiveSubscriptions).toContainEqual(subscriptionPaidRoot1);
    expect(step1ActiveSubscriptions).toContainEqual(subscriptionPaidRoot2);

    // Test the second step: Get subOffers based on active subscriptions
    const step2SubOffers = await service.getSubOffers(step1ActiveSubscriptions);

    // Expect that step2SubOffers contain the created suboffers
    expect(step2SubOffers).toContainEqual(addVersion0(asRecord(offerChild1)));
    offerChild2.weight = 0; // add a default weight value (the mocks intentionally didn't add one)
    expect(step2SubOffers).toContainEqual(addVersion0(asRecord(offerChild2)));
    expect(step2SubOffers.length).toEqual(2);

    // Test the third step: Get regular offers
    const step3RegularOffers = await service.getRegularOffers();

    // Expect that step3RegularOffers contain the root offers
    offerRoot1.weight = 0; // add default filled by db fields
    expect(step3RegularOffers).toContainEqual(
      addVersion0(asRecord(offerRoot1)),
    );
    offerRoot2.weight = 0; // add default filled by db fields
    expect(step3RegularOffers).toContainEqual(
      addVersion0(asRecord(offerRoot2)),
    );
    expect(step3RegularOffers.length).toEqual(3);

    //All the steps above + merge
    const loadedOffers = await service.loadOffers(createdUserCredits.userId);
    // Expect that loadedOffers contain the created root offers
    expect(loadedOffers).not.toContainEqual(addVersion0(asRecord(offerRoot1)));
    expect(loadedOffers).toContainEqual(addVersion0(asRecord(offerRoot2)));
    offerRoot3.weight = 0;
    expect(loadedOffers).toContainEqual(
      addVersion0(asRecord(offerRoot3 as unknown as IOffer<ObjectId>)),
    );
    // Expect that loadedOffers do not contain unpaid suboffers but contain active suboffers
    expect(loadedOffers).toContainEqual(addVersion0(asRecord(offerChild1)));
    expect(loadedOffers).toContainEqual(addVersion0(asRecord(offerChild2)));
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
        subscriptionPaidRoot1,
        subscriptionPaidRoot2,
        subscriptionPendingChild3_1,
        subscriptionRefusedChild3_2,
      ],
      tokens: 100,
      userId,
    } as unknown as IUserCredits<ObjectId>;

    const createdUserCredits: IUserCredits<ObjectId> = await service
      .getDaoFactory()
      .getUserCreditsDao()
      .create(userCredits);

    // directly calls loadOffers(), to see details, check the test above this one
    const loadedOffers = await service.loadOffers(createdUserCredits.userId);
    // Expect that loadedOffers contain the created root offers
    expect(loadedOffers).not.toContainEqual(addVersion0(asRecord(offerRoot1)));
    expect(loadedOffers).toContainEqual(addVersion0(asRecord(offerRoot2)));
    expect(loadedOffers).toContainEqual(addVersion0(asRecord(offerRoot3)));
    // Expect that loadedOffers do not contain overridden sub-offers of rootOffer2
    expect(loadedOffers).toContainEqual(addVersion0(asRecord(offerChild1)));
    expect(loadedOffers).not.toContainEqual(addVersion0(asRecord(offerChild2)));
    expect(loadedOffers).not.toContainEqual(addVersion0(asRecord(offerChild3_1)));
    expect(loadedOffers).not.toContainEqual(addVersion0(asRecord(offerChild3_2)));
    expect(loadedOffers.length).toEqual(4);
  }, 15000);
});
