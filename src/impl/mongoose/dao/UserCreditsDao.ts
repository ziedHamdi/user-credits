import { ObjectId } from "bson";

import { IUserCreditsDao } from "../../../db/dao/IUserCreditsDao";
import { ISubscription } from "../../../db/model/IUserCredits";
import { UserCredits } from "../model";
import { IMongooseUserCredits } from "../model/UserCredits";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class UserCreditsDao
  extends BaseMongooseDao<IMongooseUserCredits>
  implements IUserCreditsDao<ObjectId, IMongooseUserCredits>
{
  constructor() {
    super(UserCredits);
  }
  async findByUserId(userId: ObjectId): Promise<ISubscription<ObjectId>[]> {
    return (await super.find({ userId })) as Promise<ISubscription<ObjectId>[]>;
  }
}
