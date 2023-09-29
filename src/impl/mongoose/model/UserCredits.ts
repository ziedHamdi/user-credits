import mongoose, { Model, ObjectId, Schema } from "mongoose";

import { ISubscription, IUserCredits } from "../../../db/model/IUserCredits";

const subscriptionSchema = new Schema<
  ISubscription<ObjectId>,
  Model<ISubscription<ObjectId>>
>({
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

const userCreditsSchema = new Schema<
  IUserCredits<ObjectId>,
  Model<IUserCredits<ObjectId>>
>(
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

export default mongoose.model<IUserCredits<ObjectId>>(
  "IUserCredits",
  userCreditsSchema,
);
