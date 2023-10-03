import { ObjectId } from "mongoose";

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

  constructor(
    private uri: string,
    private dbName: string,
  ) {
    this.offerDao = new OfferDao(uri, dbName);
    this.orderDao = new OrderDao(uri, dbName);
    this.tokenTimetableDao = new TokenTimetableDao(uri, dbName);
    this.userCreditsDao = new UserCreditsDao(uri, dbName);
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
