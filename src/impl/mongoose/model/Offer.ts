import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import mongoose, { Document, Model, Schema } from "mongoose";

import { IOffer } from "../../../db/model";

export type IMongooseOffer = IOffer<ObjectId> & Document;

const offerSchema = new Schema<IMongooseOffer>({
  cycle: { enum: ["once", "monthly", "yearly"], type: String },
  hasSubOffers: { type: Boolean },
  kind: {
    enum: ["subscription", "tokens", "expertise"],
    required: true,
    type: String,
  },
  name: { required: true, type: String },
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
