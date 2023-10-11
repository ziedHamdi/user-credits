import { BaseEntity } from "./BaseEntity";

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface IOffer<K extends object> extends BaseEntity<K> {
  cycle:
    | "once"
    | "weekly"
    | "bi-weekly"
    | "monthly"
    | "trimester"
    | "semester"
    | "yearly";
  /**indicates information about exclusive offers. Designed to be a boolean*/
  hasSubOffers: unknown;
  kind: "subscription" | "tokens" | "expertise";
  name: string;
  /** the value of this field groups distinct offers so that the expiration date is computed jointly:
   * For example, a "regular" subscription offer can be in different durations (week, month, trimester, etc...).
   * To group these offers as one, use the same value for this field. Another offer could be a special service
   * eg. TV on mobile. The offers related to TV that merge should have another value for offerGroup.
   * The expiration date of the corresponding offer will be computed from the last date of the same offerGroup.
   */
  offerGroup: string;
  /**if an exclusive offer has the same key as a regular one, the exclusive offer will override the regular*/
  overridingKey: string;
  parentOfferId: K;
  price: number;
  quantityLimit: number | null;
  tokenCount: number | null;
  weight: number;
}
