import type { IOffer, IOfferDao } from "../../../../src";
import { IDaoFactory } from "../../../../src";
import {
  newObjectId,
  ObjectId,
} from "../../../service/mocks/BaseService.mocks";

const baseRootOffer = {
  cycle: "monthly",
  hasDependentOffers: false, // This offer has no sub-offers
  kind: "subscription",
  name: "Free",
  overridingKey: "free",
  price: 0,
  quantityLimit: null,
  tokenCount: 100,
  weight: 0,
} as unknown as IOffer<ObjectId>;

/* eslint-disable */
export const enum OFFER_GROUP {
  Free = "Free",
  // Standard offers
  Startup = "Startup",
  Enterprise = "Enterprise",
  ScaleUp = "ScaleUp",
  // Early Bird offers
  EbStartup = "EbStartup",
  EbEnterprise = "EbEnterprise",
  EbScaleUp = "EbScaleUp",
  // Exclusive offers unlocked on certain subscriptions
  VipEventTalk = "VipEventTalk",
  VipSeoBackLinks = "VipSeoBackLinks",
}

type MockType = {
  [key in OFFER_GROUP]: {
    [subKey: string]: any;
  };
};

/**
 * A little tricky:  Captures the value types union of T and uses them as UnionFromMockType (instead of T)
 */
type UnionFromMockType<T> = T extends {
    [K in keyof T]: infer U;
  }
  ? U
  : never;

type CompleteMockType = UnionFromMockType<MockType[OFFER_GROUP]>;

const MOCKS: MockType = {
  Free: {
    common: {
      tags: ["subscription", "standard", "monthly", "yearly"]
    },
  },
  Startup: {
    common: {},
    monthly: {
      price: 49,
      tags: ["subscription", "standard", "monthly"]
    },
    yearly: {
      price: 490,
      tags: ["subscription", "standard", "yearly"]
    }
  },
  Enterprise: {
    common: {},
    monthly: {
      price: 99,
      tags: ["subscription", "standard", "monthly"]
    },
    yearly: {
      price: 990,
      tags: ["subscription", "standard", "yearly"]
    }
  },
  ScaleUp: {
    common: {},
    monthly: {
      price: 99,
      tags: ["subscription", "standard", "monthly"]
    },
    yearly: {
      price: 990,
      tags: ["subscription", "standard", "yearly"]
    }
  },
  EbStartup: {
    common: {},
    monthly: {
      price: 49,
      tags: ["subscription", "EarlyBird", "monthly"]
    },
    yearly: {
      price: 490,
      tags: ["subscription", "EarlyBird", "yearly"]
    }
  },
  EbEnterprise: {
    common: {},
    monthly: {
      price: 99,
      tags: ["subscription", "EarlyBird", "monthly"]
    },
    yearly: {
      price: 990,
      tags: ["subscription", "EarlyBird", "yearly"]
    }
  },
  EbScaleUp: {
    common: {},
    monthly: {
      price: 99,
      tags: ["subscription", "EarlyBird", "monthly"]
    },
    yearly: {
      price: 990,
      tags: ["subscription", "EarlyBird", "yearly"]
    }
  },
  VipEventTalk: {
    common: {
      cycle: "yearly", // ends at the end of the year
      offerGroup: "VIP_TALK",
      tags: ["vip"]
    },
    _1talk: {
      name: "1-VIP-event",
      overridingKey: "1vip",
      price: 160,
      tokenCount: 1 // one event
    },
    _3talks: {
      name: "3-VIP-events",
      overridingKey: "1vip",
      price: 320,
      tokenCount: 3 // one event
    },
    _7talks: {
      name: "7-VIP-events",
      overridingKey: "1vip",
      price: 640,
      tokenCount: 7 // one event
    }
  },
  VipSeoBackLinks: {
    common: {
      cycle: "monthly", // ends at the end of the year
      offerGroup: "VIP_BACK_LINK",
      tags: ["vip"]
    },
    _1_article: {
      name: "1-article-month",
      overridingKey: "1link",
      price: 640,
      tokenCount: 1 // one event
    },
    _2_articles: {
      name: "2-articles-month",
      overridingKey: "2links",
      price: 1280,
      tokenCount: 2 // one event
    }
  }
};

/* eslint-enable */
async function preparePredefinedOffer(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>>,
  offerGroup: OFFER_GROUP,
  specific?: string,
) {
  const mockDef: CompleteMockType = MOCKS[offerGroup];
  if (!mockDef) throw new Error("Wrong key: not found in MOCKS: " + offerGroup);

  const { common, monthly, yearly } = mockDef;
  let otherFields: Record<string, unknown> = {
    _id: newObjectId(),
    name: offerGroup,
    offerGroup,
  };

  if (specific == "m") {
    otherFields = { ...otherFields, ...monthly };
    otherFields.cycle = "monthly";
    otherFields.overridingKey = "monthly-" + offerGroup;
  } else if (specific == "y") {
    otherFields = { ...otherFields, ...yearly };
    otherFields.cycle = "yearly";
    otherFields.overridingKey = "yearly-" + offerGroup;
  } else {
    const fieldsToAdd = specific ? mockDef[specific] : null;
    if (fieldsToAdd == null) {
      if (specific) {
        console.warn(
          "No special field found in mock ",
          offerGroup,
          " with key: ",
          specific,
        );
      }
    } else {
      otherFields = {
        ...otherFields,
        ...fieldsToAdd,
      };
    }
  }
  const offer = offerDao.build({
    ...baseRootOffer,
    ...common,
    ...otherFields,
  });

  return offer;
}

/**
 * This test reproduces the structure described in {@link /docs/offers_explained}
 *
 * @param daoFactory
 */
export async function prefillOffersForTests(
  daoFactory: IDaoFactory<ObjectId>,
) {
  const offerDao = daoFactory.getOfferDao();
  /* eslint-disable */
  // -------------------- free forever-basic subscription -------------------
  const free = await preparePredefinedOffer(offerDao, OFFER_GROUP.Free);
// -------------------- standard subscriptions -------------------
  const startupM = await preparePredefinedOffer(offerDao, OFFER_GROUP.Startup, "m");
  const startupY = await preparePredefinedOffer(offerDao, OFFER_GROUP.Startup, "y");
  const enterpriseM = await preparePredefinedOffer(offerDao, OFFER_GROUP.Enterprise, "m");
  const enterpriseY = await preparePredefinedOffer(offerDao, OFFER_GROUP.Enterprise, "y");
  const scaleUpM = await preparePredefinedOffer(offerDao, OFFER_GROUP.ScaleUp, "m");
  const scaleUpY = await preparePredefinedOffer(offerDao, OFFER_GROUP.ScaleUp, "y");
// -------------------- EarlyBird subscriptions -------------------
  const ebStartupM = await preparePredefinedOffer(offerDao, OFFER_GROUP.EbStartup, "m");
  const ebStartupY = await preparePredefinedOffer(offerDao, OFFER_GROUP.EbStartup, "y");
  const ebEnterpriseM = await preparePredefinedOffer(offerDao, OFFER_GROUP.EbEnterprise, "m");
  const ebEnterpriseY = await preparePredefinedOffer(offerDao, OFFER_GROUP.EbEnterprise, "y");
  const ebScaleUpM = await preparePredefinedOffer(offerDao, OFFER_GROUP.EbScaleUp, "m");
  const ebScaleUpY = await preparePredefinedOffer(offerDao, OFFER_GROUP.EbScaleUp, "y");

  // -------------------- VIP exclusive offers -------------------
  const vipEventTalk_1talk = await preparePredefinedOffer(offerDao, OFFER_GROUP.VipEventTalk, "_1talk");
  const vipEventTalk_3talks = await preparePredefinedOffer(offerDao, OFFER_GROUP.VipEventTalk, "_3talks");
  const vipEventTalk_7talks = await preparePredefinedOffer(offerDao, OFFER_GROUP.VipEventTalk, "_7talks");

  const vipSeoBackLinks_1_article = await preparePredefinedOffer(offerDao, OFFER_GROUP.VipSeoBackLinks, "_1_article");
  const vipSeoBackLinks_2_articles = await preparePredefinedOffer(offerDao, OFFER_GROUP.VipSeoBackLinks, "_2_articles");

  const vipDependsOnOffers = [scaleUpM, scaleUpY, ebStartupM, ebStartupY, ebEnterpriseM, ebEnterpriseY, ebScaleUpM, ebScaleUpY];
  // -------------------- VIP exclusive offers Talks-------------------
  const vipEventTalkOfferGroups = vipEventTalk_1talk.asUnlockingOffers(vipDependsOnOffers);
  vipEventTalk_3talks.asUnlockingOffers(vipDependsOnOffers);
  vipEventTalk_7talks.asUnlockingOffers(vipDependsOnOffers);
  // -------------------- VIP exclusive offers BackLinks-------------------
  const vipSeoBackLinkOfferGroups = vipSeoBackLinks_1_article.asUnlockingOffers(vipDependsOnOffers);
  vipSeoBackLinks_2_articles.asUnlockingOffers(vipDependsOnOffers);

  const allOffers = {...vipDependsOnOffers, free, enterpriseM, enterpriseY, startupM, startupY, vipEventTalk_1talk, vipEventTalk_3talks, vipEventTalk_7talks, vipSeoBackLinks_1_article, vipSeoBackLinks_2_articles} as unknown as Record<string, IOffer<ObjectId>>;
  /* eslint-enable */

  // now save all the prepared data
  await Promise.all(
    Object.values(allOffers).map(async (offer) => {
      await offer.save();
    })
  );

  console.log("Inserted offers:", await offerDao.find({}));
  return {
    allOffers,
    vipEventTalkOfferGroups,
    vipSeoBackLinkOfferGroups,
  };
}
