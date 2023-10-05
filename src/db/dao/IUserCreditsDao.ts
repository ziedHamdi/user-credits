import { IUserCredits, IUserCredits } from "../model/IUserCredits";
import { IBaseDao } from "./IBaseDao";

export interface IUserCreditsDao<K extends object, D extends IUserCredits<K>>
  extends IBaseDao<D> {
  findByUserId(userId: K): Promise<IUserCredits<K>[]>;
}
