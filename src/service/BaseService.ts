import {
  IDaoFactory,
  IOfferDao,
  IOrderDao,
  ITokenTimetableDao,
  IUserCreditsDao
} from "../db/dao";
import {
  IMinimalId,
  IOffer,
  IOrder,
  ISubscription,
  ITokenTimetable,
  IUserCredits
} from "../db/model";
import { OfferCycle } from "../db/model/IOffer";
import { InvalidOrderError, PaymentError } from "../errors";
import { addDays, addMonths, addSeconds, addYears } from "../util/Dates";
import { IService } from "./IService";

export abstract class BaseService<K extends IMinimalId> implements IService<K> {
  protected daoFactory: IDaoFactory<K>;

  protected readonly offerDao: IOfferDao<K, IOffer<K>>;
  protected readonly orderDao: IOrderDao<K, IOrder<K>>;
  protected readonly tokenTimetableDao: ITokenTimetableDao<K,
    ITokenTimetable<K>>;
  protected readonly userCreditsDao: IUserCreditsDao<K, IUserCredits<K>>;

  constructor(
    daoFactory: IDaoFactory<K>,
    protected defaultCurrency: string = "usd"
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
  async loadOffers(userId: K | null, envTags?: string[]): Promise<IOffer<K>[]> {
    if (!userId) {
      return await this.getRegularOffers(envTags);
    }
    const activeSubscriptions = await this.getActiveSubscriptions(userId);
    const purchasedOfferGroups: string[] = activeSubscriptions.map(
      (subs) => subs.offerGroup
    );
    const dependentOffers = await this.offerDao.loadOffers({
      unlockedBy: purchasedOfferGroups
    });
    const regularOffers = await this.getRegularOffers(envTags);

    const mergedOffers = this.mergeOffers(regularOffers, dependentOffers);

    return mergedOffers;
  }

  async createOrder(
    offerId: K,
    userId: K,
    quantity?: number, // Optional quantity parameter
    currency: string = this.defaultCurrency
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
      offerGroup: offer.offerGroup,
      offerId,
      quantity,
      status: "pending",
      tokenCount,
      total,
      userId
    } as IOrder<K>)) as IOrder<K>;
    await this.onOrderChange(userId, order, offer);

    return order;
  }

  protected async onOrderChange(userId: K, order: IOrder<K>, offer: IOffer<K>) {
    let userCredits: IUserCredits<K> | null =
      await this.userCreditsDao.findByUserId(userId);
    userCredits = await this.updateSubscriptionsOnOrderChange(
      userCredits,
      offer,
      order,
      userId
    );

    await userCredits.save();
  }

  private async updateSubscriptionsOnOrderChange(
    userCredits: IUserCredits<K> | null,
    offer: IOffer<K>,
    order: IOrder<K>,
    userId: K
  ) {
    if (!userCredits) {
      const subscription: Partial<ISubscription<K>> = this.buildSubscription(
        offer,
        order
      );
      userCredits = await this.userCreditsDao.build({
        subscriptions: [subscription],
        userId
      });
    } else {
      // Check if a subscription with the same orderId exists
      const existingSubscription = userCredits.subscriptions.find(
        (subscription) => subscription.orderId === order._id
      );

      if (existingSubscription) {
        // Update the existing subscription
        existingSubscription.status = order.status;
        existingSubscription.starts = order.updatedAt;
      } else {
        // Create a new subscription and add it to the array
        const newSubscription: Partial<ISubscription<K>> =
          this.buildSubscription(offer, order);

        userCredits.subscriptions.push(
          newSubscription as unknown as ISubscription<K>
        );
      }
    }
    return userCredits;
  }

  protected buildSubscription(offer: IOffer<K>, order: IOrder<K>) {
    return {
      customCycle: offer.customCycle,
      cycle: offer.cycle,
      name: offer.name,
      offerGroup: offer.offerGroup,
      offerId: order.offerId,
      orderId: order._id,
      starts: order.createdAt,
      status: "pending",
      tokens: offer.tokenCount
    } as unknown as ISubscription<K>;
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
        (subscription) => subscription.status === "paid"
      ) || []
    );
  }

  /**
   * Get "regular" offers without dependent offers.
   * @returns A promise that resolves to an array of "regular" offers.
   */
  async getRegularOffers(envTags?: string[]): Promise<IOffer<K>[]> {
    // this is the simplest offer case where a user only declared some offers and some dependent offers: we make sure to filter out dependent offers
    if (!envTags) return this.offerDao.find({ unlockedBy: { $size: 0 } });

    return await this.offerDao.loadOffers({
      allTags: true,
      tags: envTags
    });
  }

  /**
   * Merge "regular" offers with unlockedOffers, applying overriding logic.
   *
   * Unlocked Offers (by a purchase) that have the same overridingKey as a regular offer override them (keeping only the promotional exclusive offers).
   * So the method returns an intersection of regularOffers and unlockedOffers that intersect on the value of overridingKey.
   *
   * Exclusive offers have a weight, in case two unlocked offers conflict, the one with the highest weight overrides the others.
   * @param regularOffers An array of "regular" offers.
   * @param unlockedOffers An array of suboffers.
   * @returns An array of merged offers.
   */
  mergeOffers(
    regularOffers: IOffer<K>[],
    unlockedOffers: IOffer<K>[]
  ): IOffer<K>[] {
    // Create a Map to store unlockedOffers by their overridingKey
    const unlockedOffersMap = new Map<string, IOffer<K>>();

    // Populate the unlockedOffersMap with unlockedOffers, overriding duplicates
    for (const unlockedOffer of unlockedOffers) {
      const existingSubOffer = unlockedOffersMap.get(
        unlockedOffer.overridingKey
      );
      if (
        !existingSubOffer ||
        unlockedOffer.weight > (existingSubOffer.weight || 0)
      ) {
        unlockedOffersMap.set(unlockedOffer.overridingKey, unlockedOffer);
      }
    }

    // Filter regularOffers to keep only those that are not overridden by unlockedOffers
    const mergedOffers = regularOffers.filter((regularOffer) => {
      const subOffer = unlockedOffersMap.get(regularOffer.overridingKey);
      return !subOffer; // Exclude offers overridden by suboffers
    });

    // Add the unlockedOffers to the mergedOffers
    mergedOffers.push(...Array.from(unlockedOffersMap.values()));

    return mergedOffers;
  }

  async isUserAlreadySubscribed(
    userId: K,
    offerId: K
  ): Promise<IOrder<K> | null> {
    const existingSubscription = await this.orderDao.findOne({
      offerId: offerId,
      status: "paid",
      userId: userId // You may want to adjust this based on your criteria
    });

    return existingSubscription;
  }

  protected async getUserCredits(userId: K): Promise<IUserCredits<K>> {
    const userCredits: IUserCredits<K> = await this.daoFactory
      .getUserCreditsDao()
      .findByUserId(userId);

    if (!userCredits) {
      throw new PaymentError(
        `Illegal state: user has no prepared userCredits (${userId}).`
      );
    }

    return userCredits;
  }

  protected calculateExpiryDate(
    startDate: Date,
    cycle: OfferCycle,
    quantity: number = 1,
    customCycle?: number
  ): Date {
    const date = new Date(startDate);

    switch (cycle) {
      case "once":
        return date;
      case "daily":
        return addDays(date, quantity);
      case "weekly":
        return addDays(date, 7 * quantity);
      case "bi-weekly":
        return addDays(date, 14 * quantity);
      case "monthly":
        return addMonths(date, quantity);
      case "trimester":
        return addMonths(date, 3 * quantity);
      case "semester":
        return addMonths(date, 4 * quantity);
      case "yearly":
        return addYears(date, quantity);
      case "custom":
        if (customCycle !== undefined && customCycle >= 0) {
          return addSeconds(date, customCycle * quantity);
        }
        break;
    }

    // Handle invalid or missing cycle
    throw new Error("Invalid or missing cycle value");
  }

  abstract afterExecute(order: IOrder<K>): Promise<IUserCredits<K>>;
}
