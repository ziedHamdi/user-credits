import { ObjectId } from "mongoose";

import {IOfferDao, IOrderDao} from "../../../db/dao";
import { MongooseModels } from "../model";
import { IMongooseOffer } from "../model/Offer";
import { BaseMongooseDao } from "./BaseMongooseDao";
import {IMongooseOrder} from "../model/Order";

export class OfferDao
  extends BaseMongooseDao<IMongooseOrder>
  implements IOrderDao<ObjectId, IMongooseOrder>
{
  constructor(uri: string, dbName: string) {
    super(MongooseModels.getInstance(uri, dbName).orderDao());
  }
}
