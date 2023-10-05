import { Types } from "mongoose"; type ObjectId = Types.ObjectId;
import mongoose, { Document, Model, Schema} from "mongoose";

import { ISubscription, IUserCredits } from "../../../db/model/IUserCredits";

export type IMongooseUserCredits = IUserCredits<ObjectId> & Document;

const subscriptionSchema = new Schema<
  ISubscription<ObjectId>,
  Model<ISubscription<ObjectId>>
>({
  expires: Date,
  offerId: {
    ref: "IOffer",
    required: true,
    type: Schema.Types.ObjectId,
  },
  starts: Date,
  status: {
    enum: ["pending", "paid", "refused"],
    required: true,
    type: String,
  },
});

const userCreditsSchema = new Schema<IMongooseUserCredits>(
  {
    subscriptions: [subscriptionSchema],
    tokens: { default: 0, required: true, type: Number },
    userId: {
      ref: "User",
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
