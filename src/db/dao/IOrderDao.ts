import {IOrder} from "../model/IOrder";
import {IBaseDao} from "./IBaseDao";

export interface IOrderDao<K extends object, D extends IOrder<K>>
    extends IBaseDao<D> {
}