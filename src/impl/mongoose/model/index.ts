import mongoose, {Model, ObjectId} from "mongoose";

import offerModel from "./Offer";
import orderModel from "./Order";
import userCreditsModel from "./UserCredits";
import {IOffer} from "../../../db/model/IOffer";
import {IOrder} from "../../../db/model/IOrder";
import {IUserCredits} from "../../../db/model/IUserCredits";

export class UserCreditsModels {
  private offer: Model<IOffer>;
  private order: Model<IOrder<ObjectId>>;
  private userCredits: Model<IUserCredits>;

  constructor() {
    this.offer = offerModel;
    this.order = orderModel;
    this.userCredits = userCreditsModel;
  }

  async init(uri: string, dbName: string) {
    if (!uri || !dbName) {
      throw new Error("Please please specify db uri and/or name");
    }

    await mongoose.connect(uri, {
      dbName,
    });
  }

  offerDao(): Model<IOffer> {
    return this.offer;
  }

  orderDao(): Model<IOrder<ObjectId>> {
    return this.order;
  }

  userCreditsDao(): Model<IUserCredits> {
    return this.userCredits;
  }
}
