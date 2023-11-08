import type { IMinimalId, IOffer } from "../model";
import type { IBaseDao } from "./IBaseDao";
import { IFindOffersParams } from "./IFindOffersParams";

export interface IOfferDao<K extends IMinimalId, D extends IOffer<K>>
  extends IBaseDao<K, D> {
  /**
   * loads offers
   * @param params}
   */
  loadOffers(params?: IFindOffersParams<K>): Promise<D[]>;

  /**
   * loads offers that's parentOfferGroup is equal to the param
   * @param parentOfferGroup
   */
  loadOffersUnlockedByGroup(parentOfferGroup: string): Promise<D[]>;

  /**
   * loads offers that have all required tags in the param
   * @param tags multiple tags where all have to be found
   */
  loadTaggedOffers(tags: string[]): Promise<D[]>;
}
