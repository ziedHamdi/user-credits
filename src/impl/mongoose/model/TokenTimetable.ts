import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import { ITokenTimetable } from "@user-credits/core";
import { Document, Schema } from "mongoose";

export type IMongooseTokenTimetable = ITokenTimetable<ObjectId> & Document;

const tokenTimetableSchema = new Schema<IMongooseTokenTimetable>(
  {
    tokens: { default: 0, required: true, type: Number },
    userId: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default tokenTimetableSchema;
