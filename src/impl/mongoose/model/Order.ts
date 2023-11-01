import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import { Document, Schema } from "mongoose";

import { IOrder, IOrderStatus } from "../../../db/model/IOrder";

export type IMongooseOrder = IOrder<ObjectId> & Document;

const orderStatusSchema = new Schema<IOrderStatus>({
  date: Date,
  message: String,
  status: {
    enum: ["pending", "paid", "refused", "error"],
    required: true,
    type: String,
  },
});

const orderSchema = new Schema<IMongooseOrder>(
  {
    // identifier on remote payment system to track status
    country: String,
    currency: String,
    customCycle: Number,
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
    history: [orderStatusSchema],
    offerGroup: {
      required: function () {
        return this.offerGroup.length > 0;
      },
      type: [String],
    },
    offerId: {
      ref: "offer",
      required: true,
      type: Schema.Types.ObjectId,
    },
    paymentIntentId: String,
    // not stored in db, only present to carry information in memory
    paymentIntentSecret: { select: false, type: String },
    quantity: Number,
    status: {
      enum: ["pending", "paid", "refused", "error"],
      required: true,
      type: String,
    },
    taxRate: Number,
    tokenCount: { required: true, type: Number },
    total: Number,
    userId: {
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

export default orderSchema;
