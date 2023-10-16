import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import mongoose, { Document, Model, Schema } from "mongoose";

import { IActivatedOffer, ISubscription, IUserCredits } from "../../../db/model/IUserCredits";

export type IMongooseUserCredits = IUserCredits<ObjectId> & Document;

const subscriptionSchema = new Schema<
  ISubscription<ObjectId>,
  Model<ISubscription<ObjectId>>
>({
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
  /**
   * Detailed documentation in interface @IOffer.offerGroup
   */
  offerGroup: { required: true, type: String },
  offerId: {
    ref: "offer",
    required: true,
    type: Schema.Types.ObjectId,
  },
  orderId: {
    ref: "order",
    required: true,
    type: Schema.Types.ObjectId,
  },
  starts: Date,
  status: {
    enum: ["pending", "paid", "refused", "error"],
    required: true,
    type: String,
  },
  tokens: { default: 0, required: true, type: Number },
});

const activatedOfferSchema = new Schema<
  IActivatedOffer,
  Model<IActivatedOffer>
>({
  expires: Date,
  starts: Date,
  tokens: { default: 0, required: true, type: Number },
});

const userCreditsSchema = new Schema<IMongooseUserCredits>(
  {
    offers: [activatedOfferSchema],
    subscriptions: [subscriptionSchema],
    userId: {
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

export default mongoose.model(
  "user_credits",
  userCreditsSchema,
) as Model<IMongooseUserCredits>;
