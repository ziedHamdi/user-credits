import { Document, Model, ObjectId } from "mongoose";

import { IUserCreditsDAO } from "../../../db/dao";
import { ISubscription } from "../../../db/model/IUserCredits";
import { UserCreditsModels } from "../model";
import UserCredits from "../model/UserCredits";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class UserCreditsDAO
  extends BaseMongooseDao<UserCredits<ObjectId>>
  implements IUserCreditsDAO<ObjectId>
{
  constructor(uri: string, dbName: string) {
    super(
      UserCreditsModels.getInstance(
        uri,
        dbName,
      ).userCreditsDao() as Model<Document>,
    );
  }
  async findByUserId(userId: ObjectId): Promise<ISubscription<ObjectId>[]> {
    return this.model.find({ userId }) as Promise<ISubscription<ObjectId>[]>;
  }
}
