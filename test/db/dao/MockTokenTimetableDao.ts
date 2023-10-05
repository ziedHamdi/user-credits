import { ObjectId } from "bson";

import { ITokenTimetableDao } from "../../../src/db/dao";
import { ITokenTimetable } from "../../../src/db/model";
import { MockBaseDao } from "./MockBaseDao";

export class MockTokenTimetableDao
  extends MockBaseDao<ITokenTimetable<ObjectId>, MockTokenTimetableDao>
  implements ITokenTimetableDao<ObjectId, ITokenTimetable<ObjectId>>
{
  constructor(
    sampleDTO: ITokenTimetable<ObjectId>,
  ) {
    super(sampleDTO);
  }
}
