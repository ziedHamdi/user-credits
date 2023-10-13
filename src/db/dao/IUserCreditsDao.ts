import { IUserCredits, IUserCredits, MinimalId } from "../model";
import { IBaseDao } from "./IBaseDao";

export interface IUserCreditsDao<K extends MinimalId, D extends IUserCredits<K>>
  extends IBaseDao<D> {
  findByUserId(userId: K): Promise<IUserCredits<K>>;
}
