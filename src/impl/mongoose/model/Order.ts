import mongoose, {ObjectId, Schema} from "mongoose";

import { IOrder, OrderStatus } from "../../../db/model/IOrder";

type MongooseOrder = IOrder<ObjectId>

const orderStatusSchema: Schema<OrderStatus> = new Schema<OrderStatus>({
  date: Date,
  message: String,
  status: {
    enum: ["pending", "paid", "refused"],
    required: true,
    type: String,
  },
});

const orderSchema = new Schema<MongooseOrder>(
  {
    // history: [orderStatusSchema],
    offerId: {
      ref: "IOffer",
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

export default mongoose.model<MongooseOrder>("IOrder", orderSchema);
