import { IOffer } from "../model";
import { IBaseDAO } from "./IBaseDAO";

export interface IOfferDao<K extends object, D extends IOffer<K>>
  extends IBaseDAO<D> {
  loadSubOffers(parentOfferId: K): Promise<D[]>;
}
