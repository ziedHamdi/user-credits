import { ISubscriptionDao} from "../db/dao";
import { IOffer } from "../db/model/IOffer";
import { IOrder } from "../db/model/IOrder";
import { ISubscription, IUserCredits } from "../db/model/IUserCredits";
import { IPayment } from "./IPayment";
import {IOfferDao} from "../db/dao/IOfferDao";
import {IUserCreditsDao} from "../db/dao/IUserCreditsDao";

export class BaseService<K extends object> implements IPayment<K> {
  private readonly userCreditsDAO: IUserCreditsDao<K, IUserCredits<K>>;
  private readonly offerDAO: IOfferDao<K, IOffer<K>>;
  private readonly subscriptionDAO: ISubscriptionDao<K>;

  constructor({ offerDAO, subscriptionDAO, userCreditsDAO }) {
    this.userCreditsDAO = userCreditsDAO;
    this.offerDAO = offerDAO;
    this.subscriptionDAO = subscriptionDAO;
  }

  /**
   * Load offers based on user ID, applying overriding logic for subOffers.
   * @param userId The user's ID.
   * @returns A promise that resolves to an array of merged offers.
   */
  async loadOffers(userId: K): Promise<IOffer<K>[]> {
    if (!userId) {
      return this.offerDAO.find({ parentOfferId: null });
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
    const userCredits = await this.userCreditsDAO.findById(userId);
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
    return this.offerDAO.find({
      hasSubOffers: false,
      parentOfferId: { $in: uniqueOfferIds },
    });
  }

  /**
   * Get "regular" offers without suboffers.
   * @returns A promise that resolves to an array of "regular" offers.
   */
  async getRegularOffers(): Promise<IOffer<K>[]> {
    return this.offerDAO.find({
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
