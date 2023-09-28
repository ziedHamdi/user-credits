import { HydratedDocument, Model } from "mongoose";

import { AppErrors } from "../../../db/Errors";
import { IOrder } from "../../../db/model/IOrder";
import { IUserCredits } from "../../../db/model/IUserCredits";
import { IPayment } from "../../../service/IPayment";
import { UserCreditsModels } from "../model";
import EntityNotFoundError = AppErrors.EntityNotFoundError;

type OrderDocument = HydratedDocument<IOrder>;
type UserCreditsDocument = HydratedDocument<IUserCredits>;

export class Payment implements IPayment {
  private readonly uri: string;
  private readonly dbName: string;
  private daoFactory: UserCreditsModels;
  private orderDao: Model<IOrder>;
  private userCreditsDao: Model<IUserCredits>;

  constructor(uri: string, dbName: string) {
    this.uri = uri;
    this.dbName = dbName;
    this.daoFactory = new UserCreditsModels();
    this.orderDao = this.daoFactory.orderDao();
    this.userCreditsDao = this.daoFactory.userCreditsDao();
  }
  async init(): Promise<Payment> {
    await this.daoFactory.init(this.uri, this.dbName);
    return this;
  }

  async createOrder(offerId: string, userId: string): Promise<OrderDocument> {
    const order: OrderDocument = await this.orderDao.create({
      offerId,
      userId,
    });
    return order;
  }

  async execute(order: IOrder): Promise<IUserCredits> {
    const newCredits = {
      subscriptions: [],
      tokens: order.tokenCount,
      userId: order.userId,
    } as IUserCredits;
    return newCredits;
  }

  async orderStatusChanged(
    orderId: string,
    status: "pending" | "paid" | "refused",
  ): Promise<IOrder> {
    const order: null | OrderDocument = await this.orderDao.findById(orderId);
    if (!order) throw new EntityNotFoundError("IOrder", orderId);
    order.status = status;
    await order.save();
    return order as IOrder;
  }

  async remainingTokens(userId: string): Promise<IUserCredits> {
    const userCredits: null | UserCreditsDocument =
      await this.userCreditsDao.findOne({ userId });
    if (!userCredits) throw new EntityNotFoundError("IUserCredits", userId);
    return userCredits;
  }
}
