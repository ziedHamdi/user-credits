import mongoose, { Document, Schema } from "mongoose";

export interface Offer extends Document {
  cycle: "once" | "monthly" | "yearly";
  kind: "subscription" | "tokens" | "expertise";
  name: string;
  price: number;
  tokensCount: number;
}

const offerSchema: Schema<Offer> = new Schema<Offer>({
  cycle: { enum: ["once", "monthly", "yearly"], type: String },
  kind: {
    enum: ["subscription", "tokens", "expertise"],
    required: true,
    type: String,
  },
  name: { required: true, type: String },
  price: { required: true, type: Number },
  tokensCount: { required: true, type: Number },
});

export default mongoose.model("Offer", offerSchema);
