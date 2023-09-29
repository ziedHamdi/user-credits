import mongoose, { Model, ObjectId } from "mongoose";

import { IOffer } from "../../../db/model/IOffer";
import { IOrder } from "../../../db/model/IOrder";
import { IUserCredits } from "../../../db/model/IUserCredits";
import offerModel from "./Offer";
import orderModel from "./Order";
import userCreditsModel from "./UserCredits";

export class UserCreditsModels {
  private offer: Model<IOffer<ObjectId>>;
  private order: Model<IOrder<ObjectId>>;
  private userCredits: Model<IUserCredits<ObjectId>>;
  private static instance: UserCreditsModels | null = null; // Static instance variable
  private static ready: boolean;

  private constructor() {
    this.offer = offerModel;
    this.order = orderModel;
    this.userCredits = userCreditsModel;
  }

  static getInstance(uri: string, dbName: string): UserCreditsModels {
    if (UserCreditsModels.instance === null) {
      UserCreditsModels.instance = new UserCreditsModels();
      UserCreditsModels.instance
        .init(uri, dbName)
        .then(() => (UserCreditsModels.ready = true))
        .catch((err) => {
          console.error("Error initializing singleton ", err);
          UserCreditsModels.instance = null;
        });
    }
    return UserCreditsModels.instance;
  }

  async init(uri: string, dbName: string) {
    if (!uri || !dbName) {
      throw new Error("Please please specify db uri and/or name");
    }

    await mongoose.connect(uri, {
      dbName,
    });
  }

  offerDao(): Model<IOffer<ObjectId>> {
    return this.offer;
  }

  orderDao(): Model<IOrder<ObjectId>> {
    return this.order;
  }

  userCreditsDao(): Model<IUserCredits<ObjectId>> {
    return this.userCredits;
  }
}
