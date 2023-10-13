import { IOrder, MinimalId } from "../model";
import { IBaseDao } from "./IBaseDao";

export interface IOrderDao<K extends MinimalId, D extends IOrder<K>>
  extends IBaseDao<D> {}
