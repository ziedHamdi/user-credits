import { ObjectId } from "mongoose";

import { MongooseModels } from "../model";
import { IMongooseTokenTimetable } from "../model/TokenTimetable";
import { BaseMongooseDao } from "./BaseMongooseDao";
import { ITokenTimetableDao } from "../../../db/dao";

export class TokenTimetableDao
  extends BaseMongooseDao<IMongooseTokenTimetable>
  implements ITokenTimetableDao<ObjectId, IMongooseTokenTimetable>
{
  constructor(uri: string, dbName: string) {
    super(MongooseModels.getInstance(uri, dbName).tokenTimetableDao());
  }
}
