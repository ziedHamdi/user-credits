import { IMinimalId, IOrder } from "../model";
import { IBaseDao } from "./IBaseDao";

export interface IOrderDao<K extends IMinimalId, D extends IOrder<K>>
  extends IBaseDao<K, D> {}
