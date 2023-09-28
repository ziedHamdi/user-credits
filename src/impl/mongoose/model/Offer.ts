import mongoose, { Schema } from "mongoose";

import { IOffer } from "../../../db/model/IOffer";

const offerSchema: Schema<IOffer> = new Schema<IOffer>({
  cycle: { enum: ["once", "monthly", "yearly"], type: String },
  kind: {
    enum: ["subscription", "tokens", "expertise"],
    required: true,
    type: String,
  },
  name: { required: true, type: String },
  price: { required: true, type: Number },
  tokensCount: { required: true, type: Number },
});

export default mongoose.model("IOffer", offerSchema);
