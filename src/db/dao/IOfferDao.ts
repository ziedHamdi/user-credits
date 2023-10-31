import { IOffer, MinimalId } from "../model";
import { IBaseDao } from "./IBaseDao";

export interface IFindOffersParams<K extends MinimalId> {
  allTags?: boolean;
  offerGroup?: string;
  parentOfferGroup?: string;
  parentOfferId?: K;
  tags?: string[];
}

export interface IOfferDao<K extends MinimalId, D extends IOffer<K>>
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
   * loads offers that's parentOfferId is equal to the param.
   * @param parentOfferId To load root offers, pass null
   */
  loadSubOffers(parentOfferId: K): Promise<D[]>;
  /**
   * loads offers that have all required tags in the param
   * @param tags multiple tags where all have to be found
   */
  loadTaggedOffers(tags: string[]): Promise<D[]>;
}
