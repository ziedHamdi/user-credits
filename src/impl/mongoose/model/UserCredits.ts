import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import type {
  IActivatedOffer,
  ISubscription,
  IUserCredits,
} from "@user-credits/core";
import { Document, Model, Schema } from "mongoose";

export type IMongooseUserCredits = IUserCredits<ObjectId> & Document;

const subscriptionSchema = new Schema<
  ISubscription<ObjectId>,
  Model<ISubscription<ObjectId>>
>({
  currency: String,
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
  expires: Date,
  name: { required: true, type: String },
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
  quantity: Number,
  starts: Date,
  status: {
    enum: [
      "pending",
      "paid",
      "refused",
      "error",
      "inconsistent",
      "partial",
      "expired",
    ],
    required: true,
    type: String,
  },
  tokens: { type: Number },
  total: Number,
});

const activatedOfferSchema = new Schema<
  IActivatedOffer,
  Model<IActivatedOffer>
>({
  expires: Date,
  offerGroup: { required: true, type: String },
  starts: Date,
  tokens: { type: Number },
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

export default userCreditsSchema;
