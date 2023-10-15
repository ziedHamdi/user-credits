import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import mongoose, { Document, Model, Schema } from "mongoose";

import { IOffer } from "../../../db/model";

export type IMongooseOffer = IOffer<ObjectId> & Document;

export const CycleSchema = new Schema({
  enum: [
    "once",
    "weekly",
    "bi-weekly",
    "monthly",
    "trimester",
    "semester",
    "yearly",
    "custom",
  ],
  type: String,
});

const offerSchema = new Schema<IMongooseOffer>({
  customCycle: Number,
  cycle: String,
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
  parentOfferId: {
    ref: "offer",
    required: false,
    type: Schema.Types.ObjectId,
  },
  price: { required: true, type: Number },
  quantityLimit: Number,
  tokenCount: { required: true, type: Number },
  weight: { default: 0, type: Number },
});

export default mongoose.model("offer", offerSchema) as Model<IMongooseOffer>;
