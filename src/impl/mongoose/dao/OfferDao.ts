import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IOfferDao } from "../../../db/dao/IOfferDao";
import { Offer } from "../model";
import { IMongooseOffer } from "../model/Offer";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class OfferDao
  extends BaseMongooseDao<IMongooseOffer>
  implements IOfferDao<ObjectId, IMongooseOffer>
{
  constructor() {
    super(Offer);
  }

  async loadSubOffers(parentOfferId: ObjectId): Promise<IMongooseOffer[]> {
    // Use find() to get sub-offers based on the parentOfferId
    return this.find({ parentOfferId });
  }
}
