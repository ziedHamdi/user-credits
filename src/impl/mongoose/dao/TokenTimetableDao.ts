import { ObjectId } from "mongoose";

import { IOrderDao } from "../../../db/dao";
import { MongooseModels } from "../model";
import { IMongooseTokenTimetable } from "../model/TokenTimetable";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class TokenTimetableDao
  extends BaseMongooseDao<IMongooseTokenTimetable>
  implements IOrderDao<ObjectId, IMongooseTokenTimetable>
{
  constructor(uri: string, dbName: string) {
    super(MongooseModels.getInstance(uri, dbName).tokenTimetableDao());
  }
}
