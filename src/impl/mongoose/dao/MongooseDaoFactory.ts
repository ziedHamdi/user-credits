import { Connection, Types } from "mongoose";
type ObjectId = Types.ObjectId;

import {
  IDaoFactory,
  IOffer,
  IOfferDao,
  IOrder,
  IOrderDao,
  ITokenTimetable,
  ITokenTimetableDao,
  IUserCredits,
  IUserCreditsDao,
} from "@user-credits/core";

import { OfferDao, OrderDao, TokenTimetableDao, UserCreditsDao } from ".";

export class MongooseDaoFactory implements IDaoFactory<ObjectId> {
  private readonly offerDao;
  private readonly orderDao;
  private readonly tokenTimetableDao;
  private readonly userCreditsDao;

  constructor(public connection: Connection) {
    this.offerDao = new OfferDao(connection);
    this.orderDao = new OrderDao(connection);
    this.tokenTimetableDao = new TokenTimetableDao(connection);
    this.userCreditsDao = new UserCreditsDao(connection);
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
