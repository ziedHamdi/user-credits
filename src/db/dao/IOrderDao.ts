import {IOrder} from "../model/IOrder";
import {IBaseDAO} from "./IBaseDAO";

export interface IOrderDao<K extends object, D extends IOrder<K>>
    extends IBaseDAO<D> {
}