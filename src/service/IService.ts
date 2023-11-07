import { IDaoFactory } from "../db/dao";
import { IMinimalId, IOffer, IOrder } from "../db/model";
import { IUserCredits } from "../db/model/IUserCredits";

/**
 * This is the main interface for the UserCredits library, allowing clients to interact with pay-as-you-go features.
 *
 * ⚠️ **WARNING:** Before using any of these methods, ensure that you have thoroughly checked and validated user
 * permissions and rules. This documentation assumes that you are in a secure and controlled environment when executing
 * these calls.
 *
 * @param K The type of foreign keys used throughout the library.
 */
export interface IService<K extends IMinimalId> {
  /**
   * This method is called by the web client (or by the payment webhook server callback) after a payment has been
   * executed by the client library, whether it was successful or not.
   * It updates the user's credits based on the provided order status.
   *
   * @param order The order resulting from a payment transaction.
   * @returns A promise that resolves to the updated user credits.
   */
  afterExecute(order: IOrder<K>): Promise<IUserCredits<K>>;

  /**
   * Creates an order for a user from a selected offer, saving the user's intention to purchase the offer.
   *
   * @param offerId The unique identifier of the selected offer.
   * @param userId The unique identifier of the user initiating the order.
   * @returns A promise that resolves to the created order.
   */
  createOrder(offerId: unknown, userId: unknown): Promise<IOrder<K>>;

  /**
   * You can define your own logic for key equality
   * @param a a key
   * @param b the other key
   */
  equals(a: K, b: K): boolean;

  /**
   * Provides access to the data access objects (DAOs) used to store data locally within the application.
   * This includes DAOs for offers, orders, token timetables, and user credits.
   *
   * @returns The DAO factory for accessing and manipulating local data.
   */
  getDaoFactory(): IDaoFactory<K>;

  /**
   * Retrieves a list of filtered anonymous offers and user-exclusive offers based on a user's unique identifier.
   * Exclusive offers become visible to users after they purchase a basic offer with the status 'paid'.
   * Exclusive offers can be overridden by other purchased offers using the `overridingKey` and `weight` properties,
   * allowing for customization of pricing and duration.
   *
   * Please read {@link /docs/offer_loading_explained.md} for a detailed explanation.
   *
   * @param userId The unique identifier of the user.
   * @param envTags The tags to filter the base offers with.
   * @returns A promise that resolves to an array of offers available to the user.
   */
  loadOffers(userId: unknown, envTags: string[]): Promise<IOffer<K>[]>;

  /**
   * Loads the current user credits status object
   * @param userId user id
   * return a {@link IUserCredits} instance if found or null
   */
  loadUserCredits(userId: K): Promise<IUserCredits<K>>;
}
