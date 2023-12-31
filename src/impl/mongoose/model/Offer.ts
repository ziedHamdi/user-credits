type ObjectId = Types.ObjectId;
import { IOffer } from "@user-credits/core";
import { Document, Schema, Types } from "mongoose";

export type IMongooseOffer = IOffer<ObjectId> & Document;

const offerSchema = new Schema<IMongooseOffer>(
  {
    appendDate: Boolean,
    combinedItems: [
      {
        // ICombinedOffer
        offerGroup: String,
        offerId: {
          ref: "offer",
          required: true,
          type: Schema.Types.ObjectId,
        },
        quantity: Number,
      },
    ],
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
  },
  {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  },
);

offerSchema.virtual("combinedOffers", {
  foreignField: "_id",
  justOne: false,
  localField: "combinedItems.offerId",
  // Reference the 'Offer' model
  ref: "Offer",
});

// Add instance methods to your Mongoose schema
offerSchema.methods.asUnlockingOffers = function (
  dependsOnOffers: IMongooseOffer[],
  reset = false,
): string[] {
  if (reset) this.unlockedBy = [];
  const distinctOfferGroups = new Set<string>(this.unlockedBy);

  dependsOnOffers.forEach((offer) => {
    offer.hasDependentOffers = true;
    distinctOfferGroups.add(offer.offerGroup);
  });

  // Iterate through the dependsOnOffers and add offerGroups to the Set
  dependsOnOffers.forEach((offer) => {
    distinctOfferGroups.add(offer.offerGroup);
  });

  this.unlockedBy = Array.from(distinctOfferGroups);
  return this.unlockedBy;
};

offerSchema.methods.asUnlockingOfferGroups = function (
  offerGroups: string[],
  reset = false,
): string[] {
  if (reset) this.unlockedBy = [];
  const distinctOfferGroups = new Set([...offerGroups, ...this.unlockedBy]);

  this.unlockedBy = Array.from(distinctOfferGroups);
  return this.unlockedBy;
};

export default offerSchema;
