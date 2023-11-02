import { Types } from "mongoose";

type ObjectId = Types.ObjectId;
import { Document, Schema } from "mongoose";

import { IOffer } from "../../../db/model";

export type IMongooseOffer = IOffer<ObjectId> & Document;

const offerSchema = new Schema<IMongooseOffer>({
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
  hasDependentOffers: { type: Boolean },
  kind: {
    enum: ["subscription", "tokens", "expertise"],
    required: true,
    type: String,
  },
  name: { required: true, type: String },
  /**
   * Detailed documentation in interface @IOffer.offerGroup
   */
  offerGroup: { required: true, type: String },
  overridingKey: String,
  popular: { type: Number },
  price: { required: true, type: Number },
  quantityLimit: Number,
  tags: { default: [], type: [String] },
  tokenCount: { required: true, type: Number },
  unlockedBy: { default: [], type: [String] },
  weight: { default: 0, type: Number },
});

// Add instance methods to your Mongoose schema
offerSchema.methods.asDependentOffers = function (
  dependsOnOffers: IMongooseOffer[],
  reset = false,
): string[] {
  if (reset) this.unlockedBy = [];
  const distinctOfferGroups = new Set<string>(this.unlockedBy);

  dependsOnOffers.forEach((offer) => {
    offer.hasDependentOffers = true;
    distinctOfferGroups.add(offer.offerGroup);
  });

  if (distinctOfferGroups.size == 0) {
  }

  // Iterate through the dependsOnOffers and add offerGroups to the Set
  dependsOnOffers.forEach((offer) => {
    distinctOfferGroups.add(offer.offerGroup);
  });

  this.unlockedBy = Array.from(distinctOfferGroups);
  return this.unlockedBy;
};

offerSchema.methods.asDependentOfferGroups = function (
  offerGroups: string[],
  reset = false,
): string[] {
  if (reset) this.unlockedBy = [];
  const distinctOfferGroups = new Set([...offerGroups, ...this.unlockedBy]);

  this.unlockedBy = Array.from(distinctOfferGroups);
  return this.unlockedBy;
};

export default offerSchema;
