import { Types } from "mongoose"; type ObjectId = Types.ObjectId;

import { IUserCreditsDao } from "../../../db/dao/IUserCreditsDao";
import { IUserCredits } from "../../../db/model/IUserCredits";
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

  findByUserId(userId: ObjectId): Promise<IUserCredits<ObjectId>[]> {
    return super.find({ userId }) as Promise<IUserCredits<ObjectId>[]>;
  }
}
