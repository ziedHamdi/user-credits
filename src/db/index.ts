import mongoose, { Model } from "mongoose";

import offerSchema, { Offer } from "./schema/Offer";
import orderSchema, { Order } from "./schema/Order";
import userCreditsSchema, { UserCredits } from "./schema/UserCredits";

export class UserCreditsModels {
  private offer: Model<Offer>;
  private order: Model<Order>;
  private userCredits: Model<UserCredits>;

  constructor() {
    // @ts-ignore
    this.offer = mongoose.model("Offer", offerSchema);
    // @ts-ignore
    this.order = mongoose.model("Order", orderSchema);
    // @ts-ignore
    this.userCredits = mongoose.model("UserCredits", userCreditsSchema);
  }

  async init(uri: string, dbName: string) {
    if (!uri || !dbName) {
      throw new Error("Please please specify db uri and/or name");
    }

    await mongoose.connect(uri, {
      dbName,
    });
  }

  getOffer(): Model<Offer> {
    return this.offer;
  }

  getOrder(): Model<Order> {
    return this.order;
  }

  getUserCredits(): Model<UserCredits> {
    return this.userCredits;
  }
}
