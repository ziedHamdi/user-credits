import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IDaoFactory } from "../../../db/dao";
import { IOffer, IOrder, IUserCredits } from "../../../db/model";
import { OrderStatus } from "../../../db/model/IOrder";
import { EntityNotFoundError } from "../../../errors/EntityNotFoundError";
import { BaseService } from "../../../service/BaseService";
import { IMongooseOrder } from "../model/Order";

export class Payment extends BaseService<ObjectId> {
  constructor(daoFactory: IDaoFactory<ObjectId>) {
    super(daoFactory);
  }

  async createOrder(
    offerId: ObjectId,
    userId: ObjectId,
  ): Promise<IMongooseOrder> {
    const order: IMongooseOrder = (await this.orderDao.create({
      offerId: offerId,
      status: "pending",
      tokenCount: 100,
      userId: userId,
    })) as IMongooseOrder;
    return order;
  }

  async execute(order: IOrder<ObjectId>): Promise<IUserCredits<ObjectId>> {
    const newCredits = {
      subscriptions: [],
      tokens: order.tokenCount,
      userId: order.userId,
    } as IUserCredits<ObjectId>;
    return newCredits;
  }

  async orderStatusChanged(
    orderId: ObjectId,
    status: "pending" | "paid" | "refused",
  ): Promise<IOrder<ObjectId>> {
    const order: null | IOrder<ObjectId> =
      await this.orderDao.findById(orderId);
    if (!order) throw new EntityNotFoundError("IOrder", orderId);
    order.status = status;
    await order.save();
    return order as IOrder<ObjectId>;
  }

  async remainingTokens(userId: ObjectId): Promise<IUserCredits<ObjectId>> {
    const userCredits: null | IUserCredits<ObjectId> =
      await this.userCreditsDao.findOne({ userId });
    if (!userCredits) throw new EntityNotFoundError("IUserCredits", userId);
    return userCredits;
  }

}
