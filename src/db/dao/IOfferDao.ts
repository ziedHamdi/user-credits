import { IOffer, MinimalId } from "../model";
import { IBaseDao } from "./IBaseDao";

export interface IOfferDao<K extends MinimalId, D extends IOffer<K>>
  extends IBaseDao<D> {
  /**
   * loads offers that's parentOfferGroup is equal to the param
   * @param parentOfferGroup
   */
  loadSubGroupOffers(parentOfferGroup: string): Promise<D[]>;
  /**
   * loads offers that's parentOfferId is equal to the param
   * @param parentOfferGroup
   */
  loadSubOffers(parentOfferId: K): Promise<D[]>;
  /**
   * loads offers that have all required tags in the param
   * @param parentOfferGroup
   */
  loadTaggedOffers(tags: string[]): Promise<D[]>;
}
