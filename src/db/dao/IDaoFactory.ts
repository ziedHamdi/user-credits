import { MinimalId } from "../model";
import { IOffer } from "../model/IOffer";
import { IOrder } from "../model/IOrder";
import { ITokenTimetable } from "../model/ITokenTimetable";
import { IUserCredits } from "../model/IUserCredits";
import {
  IOfferDao,
  IOrderDao,
  ITokenTimetableDao,
  IUserCreditsDao,
} from "./index";

export interface IDaoFactory<K extends MinimalId> {
  getOfferDao(): IOfferDao<K, IOffer<K>>;
  getOrderDao(): IOrderDao<K, IOrder<K>>;
  getTokenTimetableDao(): ITokenTimetableDao<K, ITokenTimetable<K>>;
  getUserCreditsDao(): IUserCreditsDao<K, IUserCredits<K>>;
}
