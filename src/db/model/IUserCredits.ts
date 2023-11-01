import { IBaseEntity } from "./IBaseEntity";
import { IActivatedOffer } from "./IActivatedOffer";
import { ISubscription } from "./ISubscription";
import { MinimalId } from "./MinimalId";

/**
 * Interface representing user credits on multiple offerGroups.
 * @param K - The type of foreign keys (used for all foreign key types).
 */
export interface IUserCredits<K extends MinimalId> extends IBaseEntity<K> {
  /**
   * An array of activated offers. There's at most one offer per order with status "paid".
   * The offerGroup value is used to group multiple offers belonging to the same service.
   * For example, consider the "Mobile TV Basic" offer with multiple subscription options like 1 month, 3 months, and 1 year subscriptions.
   * Subscribing to one of these offers extends the same expiration date and adds tokens to the existing ones.
   * Another offer group, such as "Sport channels Mobile TV," will not interfere with the basic one in its consumed tokens.
   * You can compute back these tokens and expiry dates by analyzing the subscriptions property.
   */
  offers: IActivatedOffer[];

  /**
   * An array of subscriptions. There's exactly one subscription per order (even if not paid yet).
   * This array provides a summary of the order's last state.
   * To retrieve the history of states, you can check the @IOrder.history property.
   */
  subscriptions: ISubscription<K>[];

  /**
   * The user associated with these credits.
   * The library only needs the user's ID to associate it.
   * You can use an internal user ID and pair it with this library's user ID for security.
   */
  userId: K;
}
