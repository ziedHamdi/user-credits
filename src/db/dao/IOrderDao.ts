import { IOrder, IMinimalId } from "../model";
import { IBaseDao } from "./IBaseDao";

export interface IOrderDao<K extends IMinimalId, D extends IOrder<K>>
  extends IBaseDao<D> {}
