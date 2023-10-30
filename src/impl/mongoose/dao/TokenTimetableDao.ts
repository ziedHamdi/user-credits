import { Connection, Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { ITokenTimetableDao } from "../../../db/dao";
import { ITokenTimetable } from "../../../db/model";
import { TokenTimetable } from "../model";
import { IMongooseTokenTimetable } from "../model/TokenTimetable";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class TokenTimetableDao
  extends BaseMongooseDao<IMongooseTokenTimetable, ITokenTimetable<ObjectId>>
  implements ITokenTimetableDao<ObjectId, IMongooseTokenTimetable>
{
  constructor(connection: Connection) {
    super(connection, TokenTimetable, "token_timetable");
  }
}
