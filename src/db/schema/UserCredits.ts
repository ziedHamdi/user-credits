import mongoose, { Document, Schema } from "mongoose";

export interface Subscription extends Document {
  expires: Date;
  offer: mongoose.Types.ObjectId;
  starts: Date;
  status: "pending" | "paid" | "refused";
}

const subscriptionSchema: Schema<Subscription> = new Schema<Subscription>({
  expires: Date,
  offer: { ref: "Offer", required: true, type: mongoose.Schema.Types.ObjectId },
  starts: Date,
  status: {
    enum: ["pending", "paid", "refused"],
    required: true,
    type: String,
  },
});

export interface UserCredits extends Document {
  subscriptions: Subscription[];
  tokens: number;
  userId: mongoose.Types.ObjectId;
}

const userCreditsSchema: Schema<UserCredits> = new Schema<UserCredits>(
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

export default mongoose.model("UserCredits", userCreditsSchema);
