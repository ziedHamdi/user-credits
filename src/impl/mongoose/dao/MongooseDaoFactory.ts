import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import {
  IDaoFactory,
  IOfferDao,
  IOrderDao,
  ITokenTimetableDao,
  IUserCreditsDao,
} from "../../../db/dao";
import {
  IOffer,
  IOrder,
  ITokenTimetable,
  IUserCredits,
} from "../../../db/model";
import { OfferDao, OrderDao, TokenTimetableDao, UserCreditsDao } from ".";

export class MongooseDaoFactory implements IDaoFactory<ObjectId> {
  private readonly offerDao;
  private readonly orderDao;
  private readonly tokenTimetableDao;
  private readonly userCreditsDao;

  constructor() {
    this.offerDao = new OfferDao();
    this.orderDao = new OrderDao();
    this.tokenTimetableDao = new TokenTimetableDao();
    this.userCreditsDao = new UserCreditsDao();
  }

  getOfferDao(): IOfferDao<ObjectId, IOffer<ObjectId>> {
    return this.offerDao;
  }

  getOrderDao(): IOrderDao<ObjectId, IOrder<ObjectId>> {
    return this.orderDao;
  }

  getTokenTimetableDao(): ITokenTimetableDao<
    ObjectId,
    ITokenTimetable<ObjectId>
  > {
    return this.tokenTimetableDao;
  }

  getUserCreditsDao(): IUserCreditsDao<ObjectId, IUserCredits<ObjectId>> {
    return this.userCreditsDao;
  }
}
