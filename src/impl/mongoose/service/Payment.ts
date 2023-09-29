import { HydratedDocument, Model, ObjectId } from "mongoose";

import { AppErrors } from "../../../db/Errors";
import { IOrder } from "../../../db/model/IOrder";
import { IUserCredits } from "../../../db/model/IUserCredits";
import { IPayment } from "../../../service/IPayment";
import { UserCreditsModels } from "../model";
import EntityNotFoundError = AppErrors.EntityNotFoundError;

type OrderDocument = HydratedDocument<IOrder<ObjectId>>;
type UserCreditsDocument = HydratedDocument<IUserCredits>;

export class Payment implements IPayment<ObjectId> {
  private readonly uri: string;
  private readonly dbName: string;
  private daoFactory: UserCreditsModels;
  private orderDao: Model<IOrder<ObjectId>>;
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

  async createOrder(
    offerId: unknown,
    userId: unknown,
  ): Promise<OrderDocument> {
    const order: OrderDocument = await this.orderDao.create({
      offerId: offerId,
      status: "pending",
      tokenCount: 100,
      userId: userId,
    });
    return order;
  }

  async execute(order: IOrder<ObjectId>): Promise<IUserCredits> {
    const newCredits = {
      subscriptions: [],
      tokens: order.tokenCount,
      userId: order.userId,
    } as IUserCredits;
    return newCredits;
  }

  async orderStatusChanged(
    orderId: unknown,
    status: "pending" | "paid" | "refused",
  ): Promise<IOrder<ObjectId>> {
    const order: null | OrderDocument = await this.orderDao.findById(orderId);
    if (!order) throw new EntityNotFoundError("IOrder", orderId);
    order.status = status;
    await order.save();
    return order as IOrder<ObjectId>;
  }

  async remainingTokens(userId: ObjectId): Promise<IUserCredits> {
    const userCredits: null | UserCreditsDocument =
      await this.userCreditsDao.findOne({ userId });
    if (!userCredits) throw new EntityNotFoundError("IUserCredits", userId);
    return userCredits;
  }
}
