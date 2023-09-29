import mongoose, { ObjectId, Schema } from "mongoose";

import { IOffer } from "../../../db/model/IOffer";

const offerSchema = new Schema<IOffer<ObjectId>>({
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
    ref: "IOffer",
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  price: { required: true, type: Number },
  tokenCount: { required: true, type: Number },
});

export default mongoose.model<IOffer<ObjectId>>("IOffer", offerSchema);
