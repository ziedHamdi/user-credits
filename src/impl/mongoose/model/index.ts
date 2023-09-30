import mongoose, { Model, ObjectId } from "mongoose";

import { IOffer } from "../../../db/model/IOffer";
import { IOrder } from "../../../db/model/IOrder";
import { IUserCredits } from "../../../db/model/IUserCredits";
import offerModel, { IMongooseOffer } from "./Offer";
import orderModel, { MongooseOrder } from "./Order";
import userCreditsModel, { IMongooseUserCredits } from "./UserCredits";

export class MongooseModels {
  private offer: Model<IMongooseOffer>;
  private order: Model<MongooseOrder>;
  private userCredits: Model<IMongooseUserCredits>;
  private static instance: MongooseModels | null = null; // Static instance variable
  private static ready: boolean;

  private constructor() {
    this.offer = offerModel as Model<IMongooseOffer>;
    this.order = orderModel as Model<MongooseOrder>;
    this.userCredits = userCreditsModel as Model<IMongooseUserCredits>;
  }

  static getInstance(uri: string, dbName: string): MongooseModels {
    if (MongooseModels.instance === null) {
      MongooseModels.instance = new MongooseModels();
      MongooseModels.instance
        .init(uri, dbName)
        .then(() => (MongooseModels.ready = true))
        .catch((err) => {
          console.error("Error initializing singleton ", err);
          MongooseModels.instance = null;
        });
    }
    return MongooseModels.instance;
  }

  async init(uri: string, dbName: string) {
    if (!uri || !dbName) {
      throw new Error("Please please specify db uri and/or name");
    }

    await mongoose.connect(uri, {
      dbName,
    });
  }

  offerDao(): Model<IMongooseOffer> {
    return this.offer;
  }

  orderDao(): Model<IOrder<ObjectId>> {
    return this.order;
  }

  userCreditsDao(): Model<IMongooseUserCredits> {
    return this.userCredits;
  }
}
