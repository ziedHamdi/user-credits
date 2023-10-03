import { ObjectId } from "mongoose";

import {
  IDaoFactory,
  IOfferDao,
  IOrderDao,
  ITokenTimetableDao,
  IUserCreditsDao,
} from "../db/dao";
import {
  IOffer,
  IOrder,
  ISubscription,
  ITokenTimetable,
  IUserCredits,
} from "../db/model";
import { IPayment } from "./IPayment";

export class BaseService<K extends object> implements IPayment<K> {
  protected daoFactory: IDaoFactory<ObjectId>;

  protected readonly offerDao: IOfferDao<K, IOffer<K>>;
  protected readonly orderDao: IOrderDao<K, IOrder<K>>;
  protected readonly tokenTimetableDao: ITokenTimetableDao<
    K,
    ITokenTimetable<K>
  >;
  protected readonly userCreditsDao: IUserCreditsDao<K, IUserCredits<K>>;

  constructor(daoFactory) {
    this.daoFactory = daoFactory;

    this.offerDao = daoFactory.getOfferDao();
    this.orderDao = daoFactory.getOrderDao();
    this.tokenTimetableDao = daoFactory.getTokenTimetableDao();
    this.userCreditsDao = daoFactory.getUserCreditsDao();
  }

  /**
   * Load offers based on user ID, applying overriding logic for subOffers.
   * @param userId The user's ID.
   * @returns A promise that resolves to an array of merged offers.
   */
  async loadOffers(userId: K): Promise<IOffer<K>[]> {
    if (!userId) {
      return this.offerDao.find({ parentOfferId: null });
    }

    const activeSubscriptions = await this.getActiveSubscriptions(userId);
    const subOffers = await this.getSubOffers(activeSubscriptions);
    const regularOffers = await this.getRegularOffers();

    const mergedOffers = this.mergeOffers(regularOffers, subOffers);

    return mergedOffers;
  }

  /**
   * Get active subscriptions for a user.
   * @param userId The user's ID.
   * @returns A promise that resolves to an array of active subscriptions.
   */
  async getActiveSubscriptions(userId: K): Promise<ISubscription<K>[]> {
    const userCredits = await this.userCreditsDao.findById(userId);
    return (userCredits ?? null).subscriptions.filter(
      (subscription) => subscription.status === "paid",
    );
  }

  /**
   * Get suboffers corresponding to active subscriptions.
   * @param subscriptions An array of active subscriptions.
   * @returns A promise that resolves to an array of suboffers.
   */
  async getSubOffers(subscriptions: ISubscription<K>[]): Promise<IOffer<K>[]> {
    const uniqueOfferIds = [
      ...new Set(subscriptions.map((sub) => sub.offerId)),
    ];
    return this.offerDao.find({
      hasSubOffers: false,
      parentOfferId: { $in: uniqueOfferIds },
    });
  }

  /**
   * Get "regular" offers without suboffers.
   * @returns A promise that resolves to an array of "regular" offers.
   */
  async getRegularOffers(): Promise<IOffer<K>[]> {
    return this.offerDao.find({
      hasSubOffers: false,
      overridingKey: { $exists: false },
    });
  }

  /**
   * Merge "regular" offers with suboffers, applying overriding logic.
   * @param regularOffers An array of "regular" offers.
   * @param subOffers An array of suboffers.
   * @returns An array of merged offers.
   */
  mergeOffers(regularOffers: IOffer<K>[], subOffers: IOffer<K>[]): IOffer<K>[] {
    const subOffersMap = this.groupSubOffersByParent(subOffers);

    return regularOffers.map((offer) => {
      const mergedOffer = { ...offer };

      if (offer.overridingKey) {
        const overridingSubOffers = subOffersMap[offer.overridingKey];
        if (overridingSubOffers) {
          mergedOffer.subOffers = [
            ...(mergedOffer.subOffers || []),
            ...overridingSubOffers,
          ];
        }
      }

      return mergedOffer;
    });
  }

  /**
   * Group suboffers by their parentOfferId.
   * @param subOffers An array of suboffers.
   * @returns An object where keys are parentOfferIds and values are arrays of suboffers.
   */
  groupSubOffersByParent(subOffers: IOffer<K>[]): Record<string, IOffer<K>[]> {
    return subOffers.reduce(
      (acc, subOffer) => {
        if (!acc[subOffer.parentOfferId.toString()]) {
          acc[subOffer.parentOfferId.toString()] = [];
        }
        acc[subOffer.parentOfferId.toString()].push(subOffer);
        return acc;
      },
      {} as Record<string, IOffer<K>[]>,
    );
  }

  createOrder(offerId: unknown, userId: unknown): Promise<IOrder<K>> {
    return Promise.resolve(undefined);
  }

  execute(order: IOrder<K>): Promise<IUserCredits<K>> {
    return Promise.resolve(undefined);
  }

  orderStatusChanged(
    orderId: unknown,
    status: "pending" | "paid" | "refused",
  ): Promise<IOrder<K>> {
    return Promise.resolve(undefined);
  }

  remainingTokens(userId: unknown): Promise<IUserCredits<K>> {
    return Promise.resolve(undefined);
  }
}
