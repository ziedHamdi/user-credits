//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
// FIXME references to ObjectID should be removed as this file is testing the interface IOfferDao not its implementation in mongoose
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import type {
  IDaoFactory,
  IMinimalId,
  IOfferDao,
  IOrder,
  IUserCredits,
} from "@user-credits/core";
import { BaseService } from "@user-credits/core";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";

import { IMongooseOffer } from "../../../src/impl/mongoose/model/Offer";
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
// import { toHaveSameFields } from "../../extend/sameObjects";
import { initMocks, ObjectId } from "../../service/mocks/BaseService.mocks";
import {
  OFFER_GROUP,
  prefillOffersForTests,
} from "../mongoose/mocks/step1_PrepareLoadOffers";

export class ExtendedBaseService<K extends IMinimalId> extends BaseService<K> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterExecute(order: IOrder<K>): Promise<IUserCredits<K>> {
    return Promise.resolve(undefined as unknown as IUserCredits<K>);
  }
}

function offerNames(offers: IMongooseOffer[]): string[] {
  return offers.map((offer) => offer.name);
}

describe("OfferDao specific methods", () => {
  let mongooseDaoFactory: IDaoFactory<ObjectId>;
  let mongoMemoryServer: MongoMemoryServer;
  let connection: Connection;
  let offerDao: IOfferDao<ObjectId, IMongooseOffer>;

  beforeEach(async () => {
    // Initialize mocks and dependencies here.
    const mocks = await initMocks(false);
    ({ connection, mongoMemoryServer, mongooseDaoFactory } = mocks);
    offerDao = mongooseDaoFactory.getOfferDao() as IOfferDao<
      ObjectId,
      IMongooseOffer
    >;

    await prefillOffersForTests(mongooseDaoFactory);
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
      expect(offers.length).toBe(19);
    });
    it("should load all offers if passed an empty tag list with allTags on", async () => {
      const offers = await offerDao.loadOffers({
        allTags: true,
        tags: [],
      });
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offers.length).toBe(19);
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
      expect(subOffers.length).toBe(2);
    }, 10000);
  });

  // Test loading offers based on query parameters: check the docs {@link /docs/offers_explained.md} for reference
  describe("loadOffers from loadOffersTestsPrefill: as described in docs", () => {
    it("should load offers based on null query parameters", async () => {
      const offers = await offerDao.loadOffers();
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offers.length).toBe(19);
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
          "EbEnterprise",
          "1-article-month",
          "2-articles-month",
        ]),
      );
      expect(offers.length).toBe(8);
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
        expect.arrayContaining(["1-article-month", "2-articles-month"]),
      );
      expect(offers.length).toBe(2);
    });
    it("should load 3 offers under the 'VipEventTalk' offerGroup", async () => {
      const params = {
        offerGroup: OFFER_GROUP.AiTokens,
      };
      const offers = await offerDao.loadOffers(params);
      // Write your Jest assertions to check if the offers were loaded correctly
      expect(Array.isArray(offers)).toBe(true);
      expect(offerNames(offers)).toEqual(
        expect.arrayContaining([
          "_20tokens",
          "_100tokens",
          "_300tokens",
          "_700tokens",
        ]),
      );
      expect(offers.length).toBe(4);
    });
  });
});
