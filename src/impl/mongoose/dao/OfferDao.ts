import { Connection, Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IOfferDao } from "../../../db/dao/IOfferDao";
import { IOffer } from "../../../db/model";
import { Offer } from "../model";
import { IMongooseOffer } from "../model/Offer";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class OfferDao
  extends BaseMongooseDao<IMongooseOffer, IOffer<ObjectId>>
  implements IOfferDao<ObjectId, IMongooseOffer>
{
  constructor(connection: Connection) {
    super(connection, Offer, "offer");
  }

  async loadTaggedOffers(tags: string[]): Promise<IMongooseOffer[]> {
    return this.find({ tags: { $all: tags } });
  }

  async loadSubOffers(parentOfferId: ObjectId): Promise<IMongooseOffer[]> {
    // Use find() to get sub-offers based on _id and parentOfferId
    return this.find({ parentOfferId });
  }

  async loadSubGroupOffers(
    parentOfferGroup: string,
  ): Promise<IMongooseOffer[]> {
    // Use find() to get sub-offers based on offerGroup and parentOfferGroup
    return this.find({ parentOfferGroup });
  }
}
