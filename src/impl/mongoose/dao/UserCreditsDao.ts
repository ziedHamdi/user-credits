import { ObjectId } from "mongoose";

import { ISubscription } from "../../../db/model/IUserCredits";
import { MongooseModels } from "../model";
import { IMongooseUserCredits } from "../model/UserCredits";
import { BaseMongooseDao } from "./BaseMongooseDao";
import {IUserCreditsDao} from "../../../db/dao/IUserCreditsDao";

export class UserCreditsDao
  extends BaseMongooseDao<IMongooseUserCredits>
  implements IUserCreditsDao<ObjectId, IMongooseUserCredits>
{
  constructor(uri: string, dbName: string) {
    super(MongooseModels.getInstance(uri, dbName).userCreditsDao());
  }
  async findByUserId(userId: ObjectId): Promise<ISubscription<ObjectId>[]> {
    return (await super.find({ userId })) as Promise<ISubscription<ObjectId>[]>;
  }
}
