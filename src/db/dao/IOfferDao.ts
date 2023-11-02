import type { IMinimalId, IOffer } from "../model";
import type { IBaseDao } from "./IBaseDao";

export interface IFindOffersParams<K extends IMinimalId> {
  allTags?: boolean;
  offerGroup?: string;
  purchasedOfferGroups?: string[];
  tags?: string[];
}

export interface IOfferDao<K extends IMinimalId, D extends IOffer<K>>
  extends IBaseDao<D> {
  /**
   * loads offers
   * @param params}
   */
  loadOffers(params: IFindOffersParams<K>): Promise<D[]>;

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
   * @param tags multiple tags where all have to be found
   */
  loadTaggedOffers(tags: string[]): Promise<D[]>;
}
