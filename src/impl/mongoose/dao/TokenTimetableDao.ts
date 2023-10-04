import { ObjectId } from "bson";

import { TokenTimetable } from "../model";
import { IMongooseTokenTimetable } from "../model/TokenTimetable";
import { BaseMongooseDao } from "./BaseMongooseDao";
import { ITokenTimetableDao } from "../../../db/dao";

export class TokenTimetableDao
  extends BaseMongooseDao<IMongooseTokenTimetable>
  implements ITokenTimetableDao<ObjectId, IMongooseTokenTimetable>
{
  constructor() {
    super(TokenTimetable);
  }
}
