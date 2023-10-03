import { ObjectId } from "mongoose";

import { IOrderDao } from "../../../db/dao";
import { MongooseModels } from "../model";
import { IMongooseOrder } from "../model/Order";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class OfferDao
  extends BaseMongooseDao<IMongooseOrder>
  implements IOrderDao<ObjectId, IMongooseOrder>
{
  constructor(uri: string, dbName: string) {
    super(MongooseModels.getInstance(uri, dbName).orderDao());
  }
}
