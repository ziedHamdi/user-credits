import { IBaseEntity } from "./IBaseEntity";
import { IMinimalId } from "./IMinimalId";

export type OfferCycle =
  | "once"
  | "daily"
  | "weekly"
  | "bi-weekly"
  | "monthly"
  | "trimester"
  | "semester"
  | "yearly"
  | "custom";

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface IOffer<K extends IMinimalId> extends IBaseEntity<K> {
  asUnlockingOfferGroups(offerGroups: string[], reset = true): string[];

  /**
   * Method to set offers this offer depends on
   * @param dependsOnOffers this offer unlocks only on purchase of at least one item of these offers groups
   * @param reset if true resets dependencies, otherwise adds the ones not already referenced
   */
  asUnlockingOffers(dependsOnOffers: IOffer<K>[], reset?: boolean): string[];
  /**
   * Only allowed to have a value when cycle=custom. Expresses the order duration before expiry in seconds.
   */
  customCycle: number | null;
  /**
   * Specifies how often the offer has to be renewed.
   */
  cycle: OfferCycle;
  /**
   * If true, signals that it unlocks other offers when purchased: check the {@link unlockedBy} field.
   */
  hasDependentOffers: boolean;

  kind: "subscription" | "tokens" | "expertise";
  name: string;
  /**
   * The value of this field groups distinct offers so that the expiration date is computed jointly:
   * For example, a "regular" subscription offer can be in different durations (week, month, trimester, etc...).
   * To group these offers as one, use the same value for this field. Another offer could be a special service
   * eg. TV on mobile. The offers related to TV that merge should have another value for offerGroup.
   * The expiration date of the corresponding offer will be computed from the last date of the same offerGroup.
   *
   * If a subscription to this offerGroup unlocks other offer, use the {@link unlockedBy} field to denote them
   * and change the value of {@link hasDependentOffers} to true.
   */
  offerGroup: string;
  /**if an exclusive offer has the same key as a regular one, the exclusive offer will override the regular*/
  overridingKey: string;
  /**
   * This field allows highlighting an offer for example with the text: "recommended". It is declared as a number to
   * allow multiple possibilities of highlighting eg. "recommended"=1, "best seller"=2
   */
  popular: number;
  price: number;
  /**
   * The maximum allowed quantity to buy if any limit exists, or null
   */
  quantityLimit: number | null;
  /**
   * Tags here are called "functional tags" in the sense that their value is intended to change the program behavior,
   * it's not an information to be displayed to the user. You can use tags to group offers that do not necessarily
   * belong to the same offerGroup. For example: you could have "monthly billing" and "yearly billing" offers along
   * with a free limited-use offer that you want to display next to both cases. While you will have the value
   * "subscription" in offerGroup for all offers, you will have both "monthly" and "yearly" tags for the free offer,
   * and only one of these tag value for the other offers ("monthly" or "yearly").
   */
  tags: string[];

  /**
   * How many tokens this offer attributes to the user when purchased
   */
  tokenCount: number | null;
  /**
   * An array of offerGroup values informing about which purchased offers unlock access to this offer.
   * For better performance, an offer that unlocks at least one other offer when purchased is marked with
   * {@link hasDependentOffers}=true
   */
  unlockedBy: string[];
  /**
   * This field works in conjunction with {@link overridingKey}: when two overrides conflict, the one with the higher
   * {@link weight} is picked.
   */
  weight: number;
}
