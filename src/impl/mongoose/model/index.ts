import mongoose, { Model } from "mongoose";

import offerModel, { IMongooseOffer } from "./Offer";
import orderModel, { IMongooseOrder } from "./Order";
import tokenTimetableModel, { IMongooseTokenTimetable } from "./TokenTimetable";
import userCreditsModel, { IMongooseUserCredits } from "./UserCredits";

export class MongooseModels {
  private readonly offer: Model<IMongooseOffer>;
  private readonly order: Model<IMongooseOrder>;
  private readonly tokenTimetable: Model<IMongooseTokenTimetable>;
  private readonly userCredits: Model<IMongooseUserCredits>;
  private static instance: MongooseModels | null = null; // Static instance variable
  private static ready: boolean;

  private constructor() {
    this.offer = offerModel as Model<IMongooseOffer>;
    this.order = orderModel as Model<IMongooseOrder>;
    this.tokenTimetable = tokenTimetableModel as Model<IMongooseTokenTimetable>;
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

  orderDao(): Model<IMongooseOrder> {
    return this.order;
  }

  tokenTimetableDao(): Model<IMongooseTokenTimetable> {
    return this.tokenTimetable;
  }

  userCreditsDao(): Model<IMongooseUserCredits> {
    return this.userCredits;
  }
}
