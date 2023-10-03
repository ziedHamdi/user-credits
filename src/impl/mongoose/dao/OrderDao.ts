import { ObjectId } from "mongoose";

import { IOrderDao } from "../../../db/dao/IOrderDao";
import { Order } from "../model";
import { IMongooseOrder } from "../model/Order";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class OrderDao
  extends BaseMongooseDao<IMongooseOrder>
  implements IOrderDao<ObjectId, IMongooseOrder>
{
  constructor() {
    super(Order);
  }
}
