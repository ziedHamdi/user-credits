import { Types } from "mongoose";

type ObjectId = Types.ObjectId;
import { Document, Schema } from "mongoose";

import { IOffer } from "../../../db/model";

export type IMongooseOffer = IOffer<ObjectId> & Document;

const offerSchema = new Schema<IMongooseOffer>({
  customCycle: Number,
  cycle: {
    enum: [
      "once",
      "daily",
      "weekly",
      "bi-weekly",
      "monthly",
      "trimester",
      "semester",
      "yearly",
      "custom",
    ],
    type: String,
  },
  hasSubGroupOffers: { type: Boolean },
  hasSubOffers: { type: Boolean },
  kind: {
    enum: ["subscription", "tokens", "expertise"],
    required: true,
    type: String,
  },
  name: { required: true, type: String },
  /**
   * Detailed documentation in interface @IOffer.offerGroup
   */
  offerGroup: {
    required: function () {
      return this.offerGroup.length > 0;
    },
    type: [String],
  },
  overridingKey: String,
  parentOfferGroup: String,
  parentOfferId: {
    ref: "offer",
    required: false,
    type: Schema.Types.ObjectId,
  },
  popular: { type: Number },
  price: { required: true, type: Number },
  quantityLimit: Number,
  tags: { type: [String] },
  tokenCount: { required: true, type: Number },
  weight: { default: 0, type: Number },
});

// Add instance methods to your Mongoose schema
offerSchema.methods.asOfferChildren = function (
  childOffers: IMongooseOffer[],
  safeMode = true,
) {
  this.hasSubOffers = true;

  for (const childOffer of childOffers) {
    if (safeMode && this.parentOfferId) {
      throw new Error(
        `Offer ${this._id} already has a parent. To override, pass safeMode = false`,
      );
    }
    childOffer.parentOfferId = this._id;
  }
};

offerSchema.methods.asGroupChildren = function (
  childOffers: IMongooseOffer[],
  safeMode = true,
) {
  if (!this.offerGroup) {
    throw new Error(
      `Offer ${this._id} doesn't have an offerGroup. Can't associate offer group children to it`,
    );
  }

  this.hasSubGroupOffers = true;

  for (const childOffer of childOffers) {
    if (safeMode && childOffer.parentOfferGroup) {
      throw new Error(
        `Offer ${this._id} already has a parent group. To override, pass safeMode = false`,
      );
    }

    //FIXME check if parentOfferGroup should be an array too
    childOffer.parentOfferGroup = this.offerGroup;
  }
};

export default offerSchema;
