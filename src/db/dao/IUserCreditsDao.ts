import {ISubscription, IUserCredits} from "../model/IUserCredits";
import {IBaseDAO} from "./IBaseDAO";

export interface IUserCreditsDao<K extends object, D extends IUserCredits<K>>
    extends IBaseDAO<D> {
  findByUserId(userId: K): Promise<ISubscription<K>[]>;
}