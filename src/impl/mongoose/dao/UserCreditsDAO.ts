import { ObjectId } from "mongoose";

import { IUserCreditsDAO } from "../../../db/dao";
import { ISubscription } from "../../../db/model/IUserCredits";
import { MongooseModels } from "../model";
import { MongooseUserCredits } from "../model/UserCredits";
import { BaseMongooseDao } from "./BaseMongooseDao";

class UserCreditsDAO
  extends BaseMongooseDao<MongooseUserCredits>
  implements IUserCreditsDAO<ObjectId>
{
  constructor(uri: string, dbName: string) {
    super(MongooseModels.getInstance(uri, dbName).userCreditsDao());
  }
  async findByUserId(userId: ObjectId): Promise<ISubscription<ObjectId>[]> {
    return (await super.find({ userId })) as Promise<ISubscription<ObjectId>[]>;
  }
}

export { UserCreditsDAO };
