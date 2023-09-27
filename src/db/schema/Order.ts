import mongoose, { Document, Schema } from "mongoose";

export interface Order extends Document {
  offer: mongoose.Types.ObjectId;
  status: "pending" | "paid" | "refused";
  tokenCount: number;
  userId: mongoose.Types.ObjectId;
}

const orderSchema: Schema<Order> = new Schema<Order>(
  {
    offer: {
      ref: "Offer",
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    status: {
      enum: ["pending", "paid", "refused"],
      required: true,
      type: String,
    },
    tokenCount: { required: true, type: Number },
    userId: {
      ref: "User",
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
