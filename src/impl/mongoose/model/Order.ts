import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import { IOrder, IOrderStatus } from "@user-credits/core";
import { Document, Schema } from "mongoose";

export type IMongooseOrder = IOrder<ObjectId> & Document;

const orderStatusSchema = new Schema<IOrderStatus>({
  date: Date,
  message: String,
  payload: String,
  status: {
    enum: ["pending", "paid", "refused", "error", "inconsistent", "partial"],
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
    expires: Date,
    history: [orderStatusSchema],
    offerGroup: { required: true, type: String },
    offerId: {
      ref: "offer",
      required: true,
      type: Schema.Types.ObjectId,
    },
    paymentIntentId: String,
    // not stored in db, only present to carry information in memory
    paymentIntentSecret: { select: false, type: String },
    quantity: Number,
    starts: Date,
    status: {
      enum: ["pending", "paid", "refused", "error", "inconsistent", "partial"],
      required: true,
      type: String,
    },
    taxRate: Number,
    tokenCount: { type: Number },
    total: Number,
    userId: {
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

export default orderSchema;
