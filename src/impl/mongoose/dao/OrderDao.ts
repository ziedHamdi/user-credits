import { ObjectId } from "mongoose";

import { MongooseModels } from "../model";
import { IMongooseOrder } from "../model/Order";
import { BaseMongooseDao } from "./BaseMongooseDao";
import {IOrderDao} from "../../../db/dao/IOrderDao";

export class OrderDao
  extends BaseMongooseDao<IMongooseOrder>
  implements IOrderDao<ObjectId, IMongooseOrder>
{
  constructor(uri: string, dbName: string) {
    super(MongooseModels.getInstance(uri, dbName).orderDao());
  }
}
