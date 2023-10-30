import { IMongooseOrder } from "../impl/mongoose/model/Order";

export class AlreadySubscribedError extends Error {
  conflictingOrder: IMongooseOrder | null;

  constructor(message: string, conflictingOrder: IMongooseOrder | null = null) {
    super(message);
    Object.setPrototypeOf(this, AlreadySubscribedError.prototype);

    this.name = "AlreadySubscribedError";
    this.conflictingOrder = conflictingOrder;
  }
}
