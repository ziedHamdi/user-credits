import type {
  IDaoFactory,
  IMinimalId,
  IOffer,
  IOrder,
  IUserCredits,
} from "../../../../src";
import { BaseService } from "../../../../src";
import {
  newObjectId,
  ObjectId,
} from "../../../service/mocks/BaseService.mocks";
import { prefillOffersForTests } from "./step1_PrepareLoadOffers";

class Service<K extends IMinimalId> extends BaseService<K> {
  afterExecute(order: IOrder<K>): Promise<IUserCredits<K>> {
    return Promise.resolve(undefined as unknown as IUserCredits<K>);
  }
}

/* eslint-disable */
export enum TestUserIds {
  User_Free = "User_Free",
  User_St_Startup = "User_St_Startup",
  User_St_ScaleUp = "User_St_ScaleUp",
  User_Eb_Enterprise = "User_Eb_Enterprise",
};

const UserOrders = {
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

async function buildOrders( user: keyof typeof TestUserIds, service: Service<ObjectId>, allOffers: Record<string, IOffer<ObjectId>>) {
  const ordersSpec = UserOrders[user];

  const createdOrders: Record<string, IOrder<ObjectId>> = {};
  for (const order of ordersSpec.orders) {
    const offerId = allOffers[order._offer]._id;
    // console.log( "await service.createOrder(offerId): for offer", allOffers[order._offer]  )
    createdOrders[offerId.toString()] =  await service.createOrder(offerId, ordersSpec.userId);
  }
  return createdOrders;
}
/* eslint-enable */

export async function prefillOrdersForTests(daoFactory: IDaoFactory<ObjectId>) {
  const { allOffers } = await prefillOffersForTests(daoFactory);

  const service = new Service<ObjectId>(daoFactory);

  const ordersPerUser: Partial<
    Record<keyof typeof TestUserIds, Record<string, IOrder<ObjectId>>>
  > = {};
  for (const key in TestUserIds) {
    ordersPerUser[key as keyof typeof TestUserIds] = await buildOrders(
      key as keyof typeof TestUserIds,
      service,
      allOffers,
    );
  }

  console.log("orders per user: ", ordersPerUser)
  return ordersPerUser;
}