import { Connection, Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IOrder, IOrderDao } from "@user-credits/core";

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
