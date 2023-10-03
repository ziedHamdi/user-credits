import { ObjectId } from "mongoose";

import { IOfferDao } from "../../../db/dao/IOfferDao";
import { MongooseModels } from "../model";
import { IMongooseOffer } from "../model/Offer";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class OfferDao
  extends BaseMongooseDao<IMongooseOffer>
  implements IOfferDao<ObjectId, IMongooseOffer>
{
  constructor(uri: string, dbName: string) {
    super(MongooseModels.getInstance(uri, dbName).offerDao());
  }
}
