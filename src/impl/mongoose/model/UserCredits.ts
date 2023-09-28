import mongoose, { Schema, Model } from "mongoose";

import { ISubscription, IUserCredits } from "../../../db/model/IUserCredits";

const subscriptionSchema = new Schema<ISubscription, Model<ISubscription>>({
  expires: Date,
  offerId: {
    ref: "IOffer",
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  starts: Date,
  status: {
    enum: ["pending", "paid", "refused"],
    required: true,
    type: String,
  },
});

const userCreditsSchema = new Schema<IUserCredits, Model<IUserCredits>>(
  {
    subscriptions: [subscriptionSchema],
    tokens: { default: 0, required: true, type: Number },
    userId: {
      ref: "User",
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUserCredits>("IUserCredits", userCreditsSchema);
