import mongoose, { Model } from "mongoose";

import offerSchema from "./Offer";
import orderSchema from "./Order";
import userCreditsSchema from "./UserCredits";
import { IOffer } from "../../../db/model/IOffer";
import { IOrder } from "../../../db/model/IOrder";
import { IUserCredits } from "../../../db/model/IUserCredits";

export class UserCreditsModels {
  private offer: Model<IOffer>;
  private order: Model<IOrder>;
  private userCredits: Model<IUserCredits>;

  constructor() {
    // @ts-ignore
    this.offer = mongoose.model("IOffer", offerSchema);
    // @ts-ignore
    this.order = mongoose.model("IOrder", orderSchema);
    // @ts-ignore
    this.userCredits = mongoose.model("IUserCredits", userCreditsSchema);
  }

  async init(uri: string, dbName: string) {
    if (!uri || !dbName) {
      throw new Error("Please please specify db uri and/or name");
    }

    await mongoose.connect(uri, {
      dbName,
    });
  }

  getOffer(): Model<IOffer> {
    return this.offer;
  }

  getOrder(): Model<IOrder> {
    return this.order;
  }

  getUserCredits(): Model<IUserCredits> {
    return this.userCredits;
  }
}
