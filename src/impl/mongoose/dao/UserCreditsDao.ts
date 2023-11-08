import { Connection, Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IUserCredits, IUserCreditsDao } from "@user-credits/core";

import { UserCredits } from "../model";
import { IMongooseUserCredits } from "../model/UserCredits";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class UserCreditsDao
  extends BaseMongooseDao<IMongooseUserCredits, IUserCredits<ObjectId>>
  implements IUserCreditsDao<ObjectId, IMongooseUserCredits>
{
  constructor(connection: Connection) {
    super(connection, UserCredits, "user_credits");
  }

  findByUserId(userId: ObjectId): Promise<IUserCredits<ObjectId>> {
    return super.findOne({ userId }) as Promise<IUserCredits<ObjectId>>;
  }
}
