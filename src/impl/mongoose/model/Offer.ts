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
  offerGroup: { required: true, type: String },
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

export default offerSchema;
