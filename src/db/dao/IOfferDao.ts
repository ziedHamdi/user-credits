import { IOffer, MinimalId } from "../model";
import { IBaseDao } from "./IBaseDao";

export interface IOfferDao<K extends MinimalId, D extends IOffer<K>>
  extends IBaseDao<D> {
  loadSubOffers(parentOfferId: K): Promise<D[]>;
}
