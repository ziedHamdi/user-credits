import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { ITokenTimetableDao } from "../../../db/dao";
import { TokenTimetable } from "../model";
import { IMongooseTokenTimetable } from "../model/TokenTimetable";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class TokenTimetableDao
  extends BaseMongooseDao<IMongooseTokenTimetable>
  implements ITokenTimetableDao<ObjectId, IMongooseTokenTimetable>
{
  constructor() {
    super(TokenTimetable);
  }
}
