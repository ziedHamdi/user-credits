import {IOffer} from "../model/IOffer";
import {IBaseDAO} from "./IBaseDAO";

export interface IOfferDao<K extends object, D extends IOffer<K>>
    extends IBaseDAO<D> {
}