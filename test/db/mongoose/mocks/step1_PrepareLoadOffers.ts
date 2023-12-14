import type {
  ICombinedOffer,
  IDaoFactory,
  IOffer,
  IOfferDao,
} from "@user-credits/core";
import * as console from "console";
import { Types } from "mongoose";

export type ObjectId = Types.ObjectId;

export function newObjectId(): ObjectId {
  return new Types.ObjectId();
}

const baseRootOffer = {
  cycle: "monthly",
  hasDependentOffers: false, // This offer has no sub-offers
  kind: "subscription",
  name: "Free",
  overridingKey: "free",
  price: 0,
  quantityLimit: null,
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
  AiTokens = "AiTokens",
  VipSeoBackLinks = "VipSeoBackLinks",
}

type MockType = {
  [key in OFFER_GROUP]: {
    [subKey: string]: any;
  };
};


function asCombined(offer: IOffer<ObjectId>, quantity: number): ICombinedOffer<ObjectId> {
  return {offerGroup: offer.offerGroup, offerId: offer._id, quantity } as unknown as ICombinedOffer<ObjectId>
}

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
      quantityLimit: 1,
      tokenCount: 10,
      tags: ["subscription", "standard", "monthly", "yearly"]
    },
  },
  Startup: {
    common: {
      appendDate: true,
    },
    monthly: {
      price: 49,
      tokenCount: 49,
      tags: ["subscription", "standard", "monthly"]
    },
    yearly: {
      price: 490,
      tags: ["subscription", "standard", "yearly"]
    }
  },
  Enterprise: {
    common: {
      appendDate: true,
    },
    monthly: {
      price: 99,
      tokenCount: 150,
      tags: ["subscription", "standard", "monthly"]
    },
    yearly: {
      price: 990,
      tags: ["subscription", "standard", "yearly"]
    }
  },
  ScaleUp: {
    common: {
      appendDate: true,
    },
    monthly: {
      price: 249,
      tokenCount: 400,
      tags: ["subscription", "standard", "monthly"]
    },
    yearly: {
      price: 2490,
      tags: ["subscription", "standard", "yearly"]
    }
  },
  EbStartup: {
    common: {
      appendDate: true,
    },
    monthly: {
      price: 25,
      tokenCount: 49,
      tags: ["subscription", "EarlyBird", "monthly"]
    },
    yearly: {
      price: 250,
      tags: ["subscription", "EarlyBird", "yearly"]
    }
  },
  EbEnterprise: {
    common: {
      appendDate: true,
    },
    monthly: {
      price: 49,
      tokenCount: 150,
      tags: ["subscription", "EarlyBird", "monthly"]
    },
    yearly: {
      price: 490,
      tags: ["subscription", "EarlyBird", "yearly"]
    }
  },
  EbScaleUp: {
    common: {
      appendDate: true,
    },
    monthly: {
      price: 99,
      tokenCount: 400,
      tags: ["subscription", "EarlyBird", "monthly"]
    },
    yearly: {
      price: 990,
      tags: ["subscription", "EarlyBird", "yearly"]
    }
  },
  AiTokens: {
    common: {
      cycle: "yearly", // ends at the end of the year
      offerGroup: OFFER_GROUP.AiTokens,
      tags: ["ai"]
    },
    _20tokens: {
      name: "_20tokens",
      overridingKey: "_20tokens",
      price: 5,
      tokenCount: 20
    },
    _100tokens: {
      name: "_100tokens",
      overridingKey: "_100tokens",
      price: 20,
      tokenCount: 100
    },
    _300tokens: {
      name: "_300tokens",
      overridingKey: "_300tokens",
      price: 40,
      tokenCount: 300 // 30% free or save $20
    },
    _700tokens: {
      name: "_700tokens",
      overridingKey: "_700tokens",
      price: 80,
      tokenCount: 700 // 300 free or save $60
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
      price: 1000,
      tokenCount: 2 // one event
    }
  }
};

/* eslint-enable */
async function preparePredefinedOffer(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>>,
  offerGroup: OFFER_GROUP,
  specific?: string,
): Promise<IOffer<ObjectId>> {
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
    otherFields.tokenCount = monthly.tokenCount * 12;
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
  // this is an offer
  return offerDao.build({
    ...baseRootOffer,
    ...common,
    ...otherFields,
  });
}

/**
 * This test reproduces the structure described in {@link https://github.com/ziedHamdi/user-credits/blob/master/docs/offers_explained.md}
 *
 * It returns an object containing all offers, along with unlockedBy group names for each of the 'conditional' offers unlocked by the purchase of another offer.
 *   return {
 *   allOffers,
 *   vipEventTalkOfferGroups,
 *   vipSeoBackLinkOfferGroups,
 * };
 *
 * allOffers lists the offers under the keys (see teh article to understand the cases):
 *   const allOffers = {
 *     free, enterpriseM, enterpriseY, startupM, startupY, vipEventTalk_1talk, vipEventTalk_3talks,
 *     scaleUpM, scaleUpY, ebStartupM, ebStartupY, ebEnterpriseM, ebEnterpriseY, ebScaleUpM, ebScaleUpY,
 *     vipEventTalk_7talks, vipSeoBackLinks_1_article, vipSeoBackLinks_2_articles
 *   };
 *
 * @param daoFactory
 */
export async function prefillOffersForTests(daoFactory: IDaoFactory<ObjectId>) {
  const offerDao = daoFactory.getOfferDao();
  /* eslint-disable */

  // -------------------- Atomic offers -------------------
  const _20tokens = await preparePredefinedOffer(offerDao, OFFER_GROUP.AiTokens, "_20tokens");
  const _100tokens = await preparePredefinedOffer(offerDao, OFFER_GROUP.AiTokens, "_100tokens");
  const _300tokens = await preparePredefinedOffer(offerDao, OFFER_GROUP.AiTokens, "_300tokens");
  const _700tokens = await preparePredefinedOffer(offerDao, OFFER_GROUP.AiTokens, "_700tokens");

  const vipSeoBackLinks_1_article = await preparePredefinedOffer(offerDao, OFFER_GROUP.VipSeoBackLinks, "_1_article");
  const vipSeoBackLinks_2_articles = await preparePredefinedOffer(offerDao, OFFER_GROUP.VipSeoBackLinks, "_2_articles");


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


  const vipDependsOnOffers = [scaleUpM, scaleUpY, ebStartupM, ebStartupY, ebEnterpriseM, ebEnterpriseY, ebScaleUpM, ebScaleUpY];
  // // -------------------- VIP exclusive offers Talks-------------------
  // const vipEventTalkOfferGroups = _100tokens.asUnlockingOffers(vipDependsOnOffers);
  // _300tokens.asUnlockingOffers(vipDependsOnOffers);
  // _700tokens.asUnlockingOffers(vipDependsOnOffers);
  // -------------------- VIP exclusive offers BackLinks-------------------
  const vipSeoBackLinkOfferGroups = vipSeoBackLinks_1_article.asUnlockingOffers(vipDependsOnOffers);
  vipSeoBackLinks_2_articles.asUnlockingOffers(vipDependsOnOffers);

  const atomicOffers = {_20tokens, _100tokens, _300tokens, _700tokens,
    vipSeoBackLinks_1_article, vipSeoBackLinks_2_articles}

  const allOffers = {
    free, enterpriseM, enterpriseY, startupM, startupY,
    scaleUpM, scaleUpY, ebStartupM, ebStartupY, ebEnterpriseM, ebEnterpriseY, ebScaleUpM, ebScaleUpY};
  /* eslint-enable */

  // now save all the prepared data
  await Promise.all(
    Object.values(atomicOffers).map(async (offer) => {
      // console.log("inserting atomic ", offer.name);
      await offer.save();
    }),
  );

  free.combinedItems = [asCombined(_20tokens, 1)];
  startupM.combinedItems = [asCombined(_100tokens, 1)];
  startupY.combinedItems = [asCombined(_100tokens, 14)];
  enterpriseM.combinedItems = [
    asCombined(_300tokens, 1),
    asCombined(vipSeoBackLinks_1_article, 1),
  ];
  enterpriseY.combinedItems = [
    asCombined(_300tokens, 14),
    asCombined(vipSeoBackLinks_1_article, 12),
  ];
  scaleUpM.combinedItems = [
    asCombined(_700tokens, 1),
    asCombined(vipSeoBackLinks_1_article, 2),
  ];
  scaleUpY.combinedItems = [
    asCombined(_700tokens, 14),
    asCombined(vipSeoBackLinks_1_article, 40),
  ];
  ebStartupM.combinedItems = [asCombined(_100tokens, 2)];
  ebStartupY.combinedItems = [asCombined(_100tokens, 28)];
  ebEnterpriseM.combinedItems = [
    asCombined(_300tokens, 2),
    asCombined(vipSeoBackLinks_1_article, 2),
  ];
  ebEnterpriseY.combinedItems = [
    asCombined(_300tokens, 28),
    asCombined(vipSeoBackLinks_1_article, 24),
  ];
  ebScaleUpM.combinedItems = [
    asCombined(_700tokens, 2),
    asCombined(vipSeoBackLinks_1_article, 4),
  ];
  ebScaleUpY.combinedItems = [
    asCombined(_700tokens, 28),
    asCombined(vipSeoBackLinks_1_article, 80),
  ];

  await Promise.all(
    Object.values(allOffers).map(async (offer) => {
      // console.log("inserting ", offer.name);
      await offer.save();
    }),
  );

  // console.log("Inserted offers:", await offerDao.find({}));
  return {
    allOffers: { ...atomicOffers, ...allOffers },
    vipSeoBackLinkOfferGroups,
  };
}
