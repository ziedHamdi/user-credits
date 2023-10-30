import { Connection, Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IOrderDao } from "../../../db/dao/IOrderDao";
import { IOrder } from "../../../db/model";
import { Order } from "../model";
import { IMongooseOrder } from "../model/Order";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class OrderDao
  extends BaseMongooseDao<IMongooseOrder, IOrder<ObjectId>>
  implements IOrderDao<ObjectId, IMongooseOrder>
{
  constructor(connection: Connection) {
    super(connection, Order, "order");
  }
}
