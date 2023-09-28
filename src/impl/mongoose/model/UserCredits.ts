import mongoose, { Schema } from "mongoose";

import { Subscription, IUserCredits } from "../../../db/model/IUserCredits";

const subscriptionSchema: Schema<Subscription> = new Schema<Subscription>({
  expires: Date,
  offer: { ref: "IOffer", required: true, type: mongoose.Schema.Types.ObjectId },
  starts: Date,
  status: {
    enum: ["pending", "paid", "refused"],
    required: true,
    type: String,
  },
});

const userCreditsSchema: Schema<IUserCredits> = new Schema<IUserCredits>(
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

export default mongoose.model("IUserCredits", userCreditsSchema);
