import { IMinimalId, IUserCredits } from "../model";
import { IBaseDao } from "./IBaseDao";

export interface IUserCreditsDao<
  K extends IMinimalId,
  D extends IUserCredits<K>,
> extends IBaseDao<D> {
  findByUserId(userId: K): Promise<IUserCredits<K>>;
}
