import { HydratedDocument, Model, ObjectId } from "mongoose";

import { IOffer } from "../../../db/model/IOffer";
import { IOrder } from "../../../db/model/IOrder";
import { IUserCredits } from "../../../db/model/IUserCredits";
import { EntityNotFoundError } from "../../../errors/EntityNotFoundError";
import { BaseService } from "../../../service/BaseService";
import { IDaoFactory, IOfferDao, IOrderDao, IUserCreditsDao } from "../../../db/dao";
import UserCredits, { IMongooseUserCredits } from "../model/UserCredits";
import { IMongooseOrder } from "../model/Order";
import { IMongooseOffer } from "../model/Offer";

type OrderDocument = HydratedDocument<IOrder<ObjectId>>;
type UserCreditsDocument = HydratedDocument<IUserCredits<ObjectId>>;

export class Payment extends BaseService<ObjectId> {

  constructor(daoFactory: IDaoFactory<ObjectId>) {
    super(daoFactory);
  }

  async createOrder(
    offerId: unknown,
    userId: unknown,
  ): Promise<IMongooseOrder> {
    const order: IMongooseOrder = await this.orderDao.create({
      history: [],
      offerId: offerId,
      status: "pending",
      tokenCount: 100,
      userId: userId
    }) as IMongooseOrder;
    return order;
  }

  async execute(order: IOrder<ObjectId>): Promise<IUserCredits<ObjectId>> {
    const newCredits = {
      subscriptions: [],
      tokens: order.tokenCount,
      userId: order.userId,
    } as IUserCredits<ObjectId>;
    return newCredits;
  }

  async orderStatusChanged(
    orderId: unknown,
    status: "pending" | "paid" | "refused",
  ): Promise<IOrder<ObjectId>> {
    const order: null | OrderDocument = await this.orderDao.findById(orderId);
    if (!order) throw new EntityNotFoundError("IOrder", orderId);
    order.status = status;
    await order.save();
    return order as IOrder<ObjectId>;
  }

  async remainingTokens(userId: ObjectId): Promise<IUserCredits<ObjectId>> {
    const userCredits: null | UserCreditsDocument =
      await this.userCreditsDao.findOne({ userId });
    if (!userCredits) throw new EntityNotFoundError("IUserCredits", userId);
    return userCredits;
  }

  async loadOffers(userId: unknown): Promise<IOffer<ObjectId>[]> {
    if (!userId) return this.offerDao.find({ parentOfferId: null });
    const userCredits = await this.userCreditsDao.findById(userId);
    // Filter active subscriptions (status is 'paid')
    const activeSubscriptions = userCredits.subscriptions.filter(
      (subscription) => subscription.status === "paid",
    );

    // Get unique offerIds from active subscriptions
    const uniqueOfferIds = [
      ...new Set(activeSubscriptions.map((sub) => sub.offerId)),
    ];

    // Find suboffers of the offers with 'hasSubOffers' set to true and their parentOfferId is in uniqueOfferIds
    const suboffers = await this.offerDao.find({
      hasSubOffers: false,
      parentOfferId: { $in: uniqueOfferIds },
    });

    // Find "regular" offers that don't have suboffers
    const regularOffers = await this.offerDao.find({
      hasSubOffers: false,
      overridingKey: { $exists: false },
    });

    // Create a map of suboffers with parentOfferId as the key
    const suboffersMap = suboffers.reduce((acc, suboffer) => {
      if (!acc[suboffer.parentOfferId]) {
        acc[suboffer.parentOfferId] = [];
      }
      acc[suboffer.parentOfferId].push(suboffer);
      return acc;
    }, {});

    // Merge suboffers with regular offers, applying overriding logic
    const mergedOffers = regularOffers.map((offer) => {
      const mergedOffer = { ...offer };

      if (offer.overridingKey) {
        const overridingSuboffers = suboffersMap[offer.overridingKey];
        if (overridingSuboffers) {
          // Apply overriding logic here (e.g., update prices, etc.)
          // Merge the overriding suboffers with the regular offer
          mergedOffer.subOffers = [
            ...(mergedOffer.subOffers || []),
            ...overridingSuboffers,
          ];
        }
      }

      return mergedOffer;
    });

    return mergedOffers;

    return offersWithSubOffers;
  }
}
