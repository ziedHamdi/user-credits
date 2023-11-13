import type { IOffer, IOrder, IService } from "@user-credits/core";

import {
  newObjectId,
  ObjectId,
} from "../../../service/mocks/BaseService.mocks";
import { prefillOffersForTests } from "./step1_PrepareLoadOffers";

/* eslint-disable */
export enum TEST_USER_IDS {
  User_Free = "User_Free",
  User_St_Startup = "User_St_Startup",
  User_St_ScaleUp = "User_St_ScaleUp",
  User_Eb_Enterprise = "User_Eb_Enterprise",
};

export const USER_ORDERS = {
  User_Free: {
    userId: newObjectId(),
    orders: [
      {
        _offer: "free",
      },
    ],
  },
  User_St_Startup: {
    userId: newObjectId(),
    orders: [
      {
        _offer: "startupY",
      },
    ],
  },
  User_St_ScaleUp: {
    userId: newObjectId(),
    orders: [
      {
        _offer: "scaleUpM",
      },
    ],
  },
  User_Eb_Enterprise: {
    userId: newObjectId(),
    orders: [
      {
        _offer: "ebEnterpriseY",
      },
      {
        _offer: "vipEventTalk_7talks",
        quantity: 2,
      },
    ],
  },
}

export async function buildOrders(user: keyof typeof TEST_USER_IDS, service: IService<ObjectId>, allOffers: Record<string, IOffer<ObjectId>>) {
  const ordersSpec = USER_ORDERS[user];

  const createdOrders: Record<string, IOrder<ObjectId>> = {};
  for (const order of ordersSpec.orders) {
    const offerId = allOffers[order._offer]._id;
    // console.log( "await service.createOrder(offerId): for offer", allOffers[order._offer]  )
    createdOrders[offerId.toString()] =  await service.createOrder(offerId, ordersSpec.userId);
  }
  return createdOrders;
}
/* eslint-enable */

/**
 * Prefills all offers using {@link prefillOffersForTests} then uses them along with the users in {@link TEST_USER_IDS}
 * to create orders as defined in {@link USER_ORDERS}
 *
 * @param service the service intended to test
 */
export async function prefillOrdersForTests(service: IService<ObjectId>) {
  const { allOffers } = await prefillOffersForTests(service.getDaoFactory());

  const ordersPerUser: Partial<
    Record<keyof typeof TEST_USER_IDS, Record<string, IOrder<ObjectId>>>
  > = {};
  for (const key in TEST_USER_IDS) {
    ordersPerUser[key as keyof typeof TEST_USER_IDS] = await buildOrders(
      key as keyof typeof TEST_USER_IDS,
      service,
      allOffers,
    );
  }

  // console.log("orders per user: ", ordersPerUser)
  return { allOffers, ordersPerUser };
}
