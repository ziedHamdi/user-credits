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
import { OfferCycle } from "../db/model/IOffer";
import { InvalidOrderError, PaymentError } from "../errors";
import { addDays, addMonths, addSeconds, addYears } from "../util/Dates";
import { IService } from "./IService";

export abstract class BaseService<K extends object> implements IService<K> {
  protected daoFactory: IDaoFactory<K>;

  protected readonly offerDao: IOfferDao<K, IOffer<K>>;
  protected readonly orderDao: IOrderDao<K, IOrder<K>>;
  protected readonly tokenTimetableDao: ITokenTimetableDao<
    K,
    ITokenTimetable<K>
  >;
  protected readonly userCreditsDao: IUserCreditsDao<K, IUserCredits<K>>;

  protected constructor(
    daoFactory: IDaoFactory<K>,
    protected defaultCurrency: string = "usd",
  ) {
    this.daoFactory = daoFactory;

    this.offerDao = daoFactory.getOfferDao();
    this.orderDao = daoFactory.getOrderDao();
    this.tokenTimetableDao = daoFactory.getTokenTimetableDao();
    this.userCreditsDao = daoFactory.getUserCreditsDao();
  }

  getDaoFactory(): IDaoFactory<K> {
    return this.daoFactory;
  }

  /**
   * Load offers based on user ID, applying overriding logic for subOffers.
   * @param userId The user's ID.
   * @returns A promise that resolves to an array of merged offers.
   */
  async loadOffers(userId: K | null): Promise<IOffer<K>[]> {
    if (!userId) {
      return this.getRegularOffers();
    }

    const activeSubscriptions = await this.getActiveSubscriptions(userId);
    const subOffers = await this.getSubOffers(activeSubscriptions);
    const regularOffers = await this.getRegularOffers();

    const mergedOffers = this.mergeOffers(regularOffers, subOffers);

    return mergedOffers;
  }

  async createOrder(
    offerId: K,
    userId: K,
    quantity?: number, // Optional quantity parameter
    currency?: string = this.defaultCurrency,
  ): Promise<IOrder<K>> {
    const offer = await this.offerDao.findOne({ _id: offerId });

    if (!offer) {
      throw new Error("Offer not found"); // Handle this case based on your requirements
    }

    // Check if the offer's maximum allowed quantity is defined and higher than the requested quantity
    if (
      offer.quantityLimit !== null &&
      quantity !== undefined &&
      quantity > offer.quantityLimit
    ) {
      throw new InvalidOrderError("Requested quantity exceeds the limit");
    }

    let tokenCount = null;
    if (offer.kind === "tokens") {
      // Set the tokenCount based on the offer kind
      tokenCount = offer.tokenCount;
    }

    const total = quantity !== undefined ? offer.price * quantity : offer.price;

    const order: IOrder<K> = (await this.orderDao.create({
      currency,
      customCycle: offer.customCycle,
      cycle: offer.cycle,
      offerId,
      quantity,
      status: "pending",
      tokenCount,
      total,
      userId,
    } as IOrder<K>)) as IOrder<K>;

    return order;
  }

  /**
   * Get active subscriptions for a user.
   * @param userId The user's ID.
   * @returns A promise that resolves to an array of active subscriptions.
   */
  async getActiveSubscriptions(userId: K): Promise<ISubscription<K>[]> {
    const userCredits: IUserCredits<K> =
      await this.userCreditsDao.findByUserId(userId);
    return (
      (userCredits?.subscriptions as ISubscription<K>[]).filter(
        (subscription) => subscription.status === "paid",
      ) || []
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
    return this.offerDao.find({ parentOfferId: null });
  }

  /**
   * Merge "regular" offers with suboffers, applying overriding logic.
   *
   * Suboffers that have the same overridingKey as a root offer override them (keeping only the promotional exclusive offers).
   * So the method returns an intersection of regularOffers and subOffers that intersect on the value of overridingKey.
   *
   * Exclusive offers have a weight, in case two sub offers conflict, the one with the highest weight overrides the others.
   * @param regularOffers An array of "regular" offers.
   * @param subOffers An array of suboffers.
   * @returns An array of merged offers.
   */
  mergeOffers(regularOffers: IOffer<K>[], subOffers: IOffer<K>[]): IOffer<K>[] {
    // Create a Map to store subOffers by their overridingKey
    const subOffersMap = new Map<string, IOffer<K>>();

    // Populate the subOffersMap with subOffers, overriding duplicates
    for (const subOffer of subOffers) {
      const existingSubOffer = subOffersMap.get(subOffer.overridingKey);
      if (
        !existingSubOffer ||
        subOffer.weight > (existingSubOffer.weight || 0)
      ) {
        subOffersMap.set(subOffer.overridingKey, subOffer);
      }
    }

    // Filter regularOffers to keep only those that are not overridden by subOffers
    const mergedOffers = regularOffers.filter((regularOffer) => {
      const subOffer = subOffersMap.get(regularOffer.overridingKey);
      return !subOffer; // Exclude offers overridden by suboffers
    });

    // Add the subOffers to the mergedOffers
    mergedOffers.push(...Array.from(subOffersMap.values()));

    return mergedOffers;
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

  async isUserAlreadySubscribed(
    userId: K,
    offerId: K,
  ): Promise<IOrder<K> | null> {
    const existingSubscription = await this.orderDao.findOne({
      offerId: offerId,
      status: "paid",
      userId: userId, // You may want to adjust this based on your criteria
    });

    return existingSubscription;
  }

  protected async getUserCredits(
    userId: K,
  ): Promise<IUserCredits<K>> {
    const userCredits: IUserCredits<K> = await this.daoFactory
      .getUserCreditsDao()
      .findByUserId(userId);

    if (!userCredits) {
      throw new PaymentError(
        `Illegal state: user has no prepared userCredits (${userId}).`,
      );
    }

    return userCredits;
  }

  protected calculateExpiryDate(
    startDate: Date,
    cycle: OfferCycle,
    customCycle?: number,
  ): Date {
    const date = new Date(startDate);

    switch (cycle) {
      case "once":
        return date;
      case "weekly":
        return addDays(date, 7);
      case "bi-weekly":
        return addDays(date, 14);
      case "monthly":
        return addMonths(date, 1);
      case "trimester":
        return addMonths(date, 3);
      case "semester":
        return addMonths(date, 6);
      case "yearly":
        return addYears(date, 1);
      case "custom":
        if (customCycle !== undefined && customCycle >= 0) {
          return addSeconds(date, customCycle);
        }
        break;
    }

    // Handle invalid or missing cycle
    throw new Error("Invalid or missing cycle value");
  }
}
