import { Connection, Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IUserCreditsDao } from "../../../db/dao/IUserCreditsDao";
import { IUserCredits } from "../../../db/model/IUserCredits";
import { UserCredits } from "../model";
import { IMongooseUserCredits } from "../model/UserCredits";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class UserCreditsDao
  extends BaseMongooseDao<IMongooseUserCredits>
  implements IUserCreditsDao<ObjectId, IMongooseUserCredits>
{
  constructor(connection: Connection) {
    super(connection, UserCredits, "user_credits");
  }

  findByUserId(userId: ObjectId): Promise<IUserCredits<ObjectId>> {
    return super.findOne({ userId }) as Promise<IUserCredits<ObjectId>>;
  }
}
