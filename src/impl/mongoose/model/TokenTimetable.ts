import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import { ITokenTimetable } from "@user-credits/core";
import { Document, Schema } from "mongoose";

export type IMongooseTokenTimetable = ITokenTimetable<ObjectId> & Document;

const tokenTimetableSchema = new Schema<IMongooseTokenTimetable>(
  {
    offerGroup: String,
    tokens: { default: 0, required: true, type: Number },
    userId: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
// Create indexes
/* eslint-disable sort-keys-fix/sort-keys-fix */
tokenTimetableSchema.index({ offerGroup: 1, createdAt: 1, tokens: 1 });
tokenTimetableSchema.index({ createdAt: 1, tokens: 1 });
/* eslint-enable sort-keys-fix/sort-keys-fix */

export default tokenTimetableSchema;
