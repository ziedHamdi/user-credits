//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
// FIXME references to ObjectID should be removed as this file is testing the interface IOfferDao not its implementation in mongoose
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import expect from "expect";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";

import { IDaoFactory, IOfferDao } from "../../../src/db/dao";
import {
  IMinimalId,
  IOffer,
  IOrder,
  ISubscription,
  IUserCredits,
} from "../../../src/db/model";
import { IActivatedOffer } from "../../../src/db/model/IActivatedOffer";
import { IMongooseOffer } from "../../../src/impl/mongoose/model/Offer";
import { BaseService } from "../../../src/service/BaseService";
import { copyFieldsWhenMatching } from "../../../src/util/Copy";
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
// import { toHaveSameFields } from "../../extend/sameObjects";
import { addVersion0, clearDatabase } from "../../extend/util";
import {
  initMocks,
  newObjectId,
  ObjectId,
} from "../../service/mocks/BaseService.mocks";
import {
  OFFER_GROUP,
  prefillOffersForTests,
} from "../mongoose/mocks/step1_PrepareLoadOffers";
import { prefillOrdersForTests } from "../mongoose/mocks/step2_ExecuteOrders";

export class ExtendedBaseService<K extends IMinimalId> extends BaseService<K> {
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
  let service: BaseService<ObjectId>;
  let mongoMemoryServer: MongoMemoryServer;
  let connection: Connection;

  beforeEach(async () => {
    // Initialize mocks and dependencies here.
    const mocks = await initMocks(false);
    ({ connection, mongoMemoryServer, mongooseDaoFactory } = mocks);
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new ExtendedBaseService<ObjectId>(mongooseDaoFactory);
  });

  afterEach(async () => {
    await mongoMemoryServer.stop(false);
    await connection.close();
  });
});

function asRecord(offerChild1: IOffer<ObjectId>): Record<string, never> {
  return offerChild1 as unknown as Record<string, never>;
}

describe("Offer Database Integration Test", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let service: BaseService<ObjectId>;
  let mongoMemoryServer: MongoMemoryServer;
  let connection: Connection;

  beforeEach(async () => {
    // Initialize your mocks and dependencies here.
    ({
      connection,
      mongoMemoryServer,
      mongooseDaoFactory,
    } = await initMocks(false));

    await prefillOrdersForTests(mongooseDaoFactory);
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new ExtendedBaseService<ObjectId>(mongooseDaoFactory);
  });

  afterEach(async () => {
    await mongoMemoryServer.stop(false);
    await connection.close();
  });

  it("should insert all offers and retrieve only root offers from the database for a null userId", async () => {
  });

  it("should correctly override conflicting offers", async () => {
  });

  it("should override offers between two active subscriptions, taking the ones with higher weights", async () => {

  });
});

function offerNames(offers: IMongooseOffer[]): string[] {
  return offers.map((offer) => offer.name);
}

describe("OfferDao specific methods", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let mongoMemoryServer: MongoMemoryServer;
  let connection: Connection;
  let offerDao: IOfferDao<ObjectId, IMongooseOffer>;
  let allOffers: Record<string, IOffer<ObjectId>>;
  let vipEventTalkOfferGroups: string[];
  let vipSeoBackLinkOfferGroups: string[];

  beforeEach(async () => {
    // Initialize mocks and dependencies here.
    const mocks = await initMocks(false);
    ({ connection, mongoMemoryServer, mongooseDaoFactory } = mocks);
    offerDao = mongooseDaoFactory.getOfferDao() as IOfferDao<
      ObjectId,
      IMongooseOffer
    >;
    ({ allOffers, vipEventTalkOfferGroups, vipSeoBackLinkOfferGroups } =
      await prefillOffersForTests(mongooseDaoFactory));
  });

  afterEach(async () => {
    await mongoMemoryServer.stop(false);
    await connection.close();
  });

  // Test loading tagged offers
  describe("loadTaggedOffers", () => {
    it("should by default load offers that do not depend on any others", async () => {
      const offers = await offerDao.loadOffers({});
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offers.length).toBe(18);
    });
  });

  // Test loading tagged offers
  describe("loadTaggedOffers", () => {
    it("should load offers with specific tags", async () => {
      const tagsToLoad = ["subscription", "monthly"];
      const offers = await offerDao.loadTaggedOffers(tagsToLoad);
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offerNames(offers)).toEqual(
        expect.arrayContaining([
          // Free is only once, but the others are twice each: monthly and yearly
          "Free",
          "Startup",
          "Enterprise",
          "ScaleUp",
          "EbStartup",
          "EbEnterprise",
          "EbScaleUp",
        ]),
      );
      expect(offers.length).toBe(7);
    });
  });

  // Test loading sub-offers
  describe("loadOffers tests", () => {
    it("should not find any unlocked offers when purchasing one of the the offers 'Startup'", async () => {
      // Insert a parent offer first
      const subOffers = await offerDao.loadOffersUnlockedByGroup(
        OFFER_GROUP.Startup,
      );
      // Write your Jest assertions to check if the sub-offers were loaded correctly
      expect(Array.isArray(subOffers)).toBe(true);
      expect(subOffers.length).toBe(0);
    });

    it("should unlock 5 offers for users who purchased one of the ScaleUp offers", async () => {
      // Insert a parent offer first
      const subOffers = await offerDao.loadOffersUnlockedByGroup(
        OFFER_GROUP.ScaleUp,
      );
      // Write your Jest assertions to check if the sub-offers were loaded correctly
      expect(Array.isArray(subOffers)).toBe(true);
      expect(subOffers.length).toBe(5);
    });
  });

  // Test loading offers based on query parameters: check the docs {@link /docs/offers_explained.md} for reference
  describe("loadOffers from loadOffersTestsPrefill: as described in docs", () => {
    it("should load offers based on null query parameters", async () => {
      const offers = await offerDao.loadOffers();
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offers.length).toBe(18);
    });
    it("should load 13 subscription offers as in the article", async () => {
      const params = {
        tags: ["subscription"],
      };
      const offers = await offerDao.loadOffers(params);
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offerNames(offers)).toEqual(
        expect.arrayContaining([
          // Free is only once, but the others are twice each: monthly and yearly
          "Free",
          "Startup",
          "Enterprise",
          "ScaleUp",
          "EbStartup",
          "EbEnterprise",
          "EbScaleUp",
        ]),
      );
      expect(offers.length).toBe(13);
    });
    it("should load 4 monthly standard offers using allTags constraint", async () => {
      const params = {
        allTags: true,
        tags: ["subscription", "monthly", "standard"],
      };
      const offers = await offerDao.loadOffers(params);
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offerNames(offers)).toEqual(
        expect.arrayContaining(["Free", "Startup", "Enterprise", "ScaleUp"]),
      );
      expect(offers.length).toBe(4);
    });
    it("should load offers based on OR condition for tags if not present query parameters", async () => {
      const params = {
        allTags: false,
        tags: ["vip", "EarlyBird"],
      };
      const offers = await offerDao.loadOffers(params);
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(offerNames(offers)).toEqual(
        expect.arrayContaining([
          "EbStartup",
          "EbEnterprise",
          "EbScaleUp",
          "EbScaleUp",
          "EbStartup",
          "1-VIP-event",
          "3-VIP-events",
          "EbEnterprise",
          "1-article-month",
          "2-articles-month",
          "7-VIP-events",
        ]),
      );
      expect(offers.length).toBe(11);
    });
    it("should load no offers unlocked by (the standard) Startup offer group", async () => {
      const params = {
        unlockedBy: [OFFER_GROUP.Startup],
      };
      const offers = await offerDao.loadOffers(params);
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offers.length).toBe(0);
    });
    it("should load 5 VIP offers unlocked by (the standard) ScaleUp offerGroup", async () => {
      const params = {
        unlockedBy: [OFFER_GROUP.ScaleUp],
      };
      const offers = await offerDao.loadOffers(params);
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offerNames(offers)).toEqual(
        expect.arrayContaining([
          "1-article-month",
          "2-articles-month",
          "1-VIP-event",
          "3-VIP-events",
          "7-VIP-events",
        ]),
      );
      expect(offers.length).toBe(5);
    });
    it("should load 3 offers under the 'VipEventTalk' offerGroup", async () => {
      const params = {
        offerGroup: OFFER_GROUP.VipEventTalk,
      };
      const offers = await offerDao.loadOffers(params);
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offerNames(offers)).toEqual(
        expect.arrayContaining(["1-VIP-event", "3-VIP-events", "7-VIP-events"]),
      );
      expect(offers.length).toBe(3);
    });
  });
});
