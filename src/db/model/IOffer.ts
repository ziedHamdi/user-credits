/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface IOffer<K extends object> {
  cycle: "once" | "weekly" | "monthly" | "yearly";
  /**indicates information about exclusive offers. Designed to be a boolean*/
  hasSubOffers: unknown;
  kind: "subscription" | "tokens" | "expertise";
  name: string;
  /**if an exclusive offer has the same key as a regular one, the exclusive offer will override the regular*/
  overridingKey: string;
  parentOfferId: K;
  price: number;
  tokenCount: number;
}
