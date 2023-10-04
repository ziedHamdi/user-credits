import { IOffer } from "../model";
import { IBaseDao } from "./IBaseDao";

export interface IOfferDao<K extends object, D extends IOffer<K>>
  extends IBaseDao<D> {
  loadSubOffers(parentOfferId: K): Promise<D[]>;
}
