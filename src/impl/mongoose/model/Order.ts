import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import mongoose, { Document, Model, Schema } from "mongoose";

import { IOrder, OrderStatus } from "../../../db/model/IOrder";

export type IMongooseOrder = IOrder<ObjectId> & Document;

const orderStatusSchema = new Schema<OrderStatus>({
  date: Date,
  message: String,
  status: {
    enum: ["pending", "paid", "refused"],
    required: true,
    type: String,
  },
});

const orderSchema = new Schema<IMongooseOrder>(
  {
    country: String,
    history: [orderStatusSchema],
    offerId: {
      ref: "IOffer",
      required: true,
      type: Schema.Types.ObjectId,
    },
    quantity: Number,
    status: {
      enum: ["pending", "paid", "refused"],
      required: true,
      type: String,
    },
    taxRate: Number,
    tokenCount: { required: true, type: Number },
    total: Number,
    userId: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

export default mongoose.model("order", orderSchema) as Model<IMongooseOrder>;
