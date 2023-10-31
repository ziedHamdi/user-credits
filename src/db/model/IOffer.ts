import { BaseEntity } from "./BaseEntity";
import { MinimalId } from "./MinimalId";

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
export interface IOffer<K extends MinimalId> extends BaseEntity<K> {
  /**
   * Method to set offers as children of this offer based on offerGroup
   * @param childIds
   * @param safeMode
   */
  asGroupChildren(childIds: IOffer<K>[], safeMode?: boolean): void;

  /**
   * Method to set offers as children of this offer based on _id
   * @param childIds
   * @param safeMode
   */
  asOfferChildren(childIds: IOffer<K>[], safeMode?: boolean): void;
  /**
   * Only allowed to have a value when cycle=custom. Expresses the order duration before expiry in seconds.
   */
  customCycle: number | null;
  /**
   * Specifies how often the offer has to be renewed.
   */
  cycle: OfferCycle;
  /**
   * If has a non null value, triggers a databse load of the subOffers of the current @field( offerGroup )
   *
   * @see offerGroup on how to group offers of the same kind
   * @see parentOfferGroup on how to define children of the current group
   */
  hasSubGroupOffers: unknown;
  /**
   * Indicates information about exclusive offers tied to this offer. If true, a subscription to this offer unlocks
   * exclusive offers that will have their parentId equal to this offer's _id (this is just an indication to tell if
   * a request to find subOffers has to be launched).
   * You might also be interested in subOffers of an offerGroup, which work along with the @field( parentOfferGroup )
   */
  hasSubOffers: unknown;
  kind: "subscription" | "tokens" | "expertise";
  name: string;
  /**
   * The value of this field groups distinct offers so that the expiration date is computed jointly:
   * For example, a "regular" subscription offer can be in different durations (week, month, trimester, etc...).
   * To group these offers as one, use the same value for this field. Another offer could be a special service
   * eg. TV on mobile. The offers related to TV that merge should have another value for offerGroup.
   * The expiration date of the corresponding offer will be computed from the last date of the same offerGroup.
   *
   * If a subscription to this offerGroup unlocks other offer, use the @field( parentOfferGroup ) to denote them
   * and put a value to the @field( hasSubGroupOffers )
   */
  offerGroup: string;
  /**if an exclusive offer has the same key as a regular one, the exclusive offer will override the regular*/
  overridingKey: string;
  /**
   * Similarly as the parentId that is used to unlock offers if a specific offer is purchased. This field is used along
   * with @field( offerGroup ) and @field( hasSubGroupOffers ) to unlock offers if a 'kind' of offer is purchased.
   *
   * @see offerGroup (the value of the parent of this subOffer). Check the field doc to understand why you may need to
   * group offers
   * @see hasSubGroupOffers if you decide to create subOffers of an offer group.
   */
  parentOfferGroup: string;
  /**
   * If an offer can only be purchased when a parentOffer is purchased (like VIP offers, or early adopters for example),
   * Use this field along with the following fields
   *
   * @see hasSubOffers in the parent offer to trigger a database search for subOffers.
   * @see _id use _id as the value for this field
   */
  parentOfferId: K;
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
   * This field works in conjunction with @field( overridingKey ): when two overrides conflict, the one with the higher
   * @field( weight ) is picked.
   */
  weight: number;
}
