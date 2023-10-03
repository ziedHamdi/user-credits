import mongoose, { ObjectId } from "mongoose";

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
    this.offerDao = new OfferDao();
    this.orderDao = new OrderDao();
    this.tokenTimetableDao = new TokenTimetableDao();
    this.userCreditsDao = new UserCreditsDao();
  }

  async init() {
    if (!this.uri || !this.dbName) {
      throw new Error("Please please specify db uri and/or name");
    }

    await mongoose.connect(this.uri, {
      dbName: this.dbName,
    });
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
