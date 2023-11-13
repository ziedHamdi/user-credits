import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { ITokenTimetable, ITokenTimetableDao } from "@user-credits/core";

import { MockBaseDao } from "./MockBaseDao";

export class MockTokenTimetableDao
  extends MockBaseDao<ITokenTimetable<ObjectId>>
  implements ITokenTimetableDao<ObjectId, ITokenTimetable<ObjectId>>
{
  constructor(sampleDTO: ITokenTimetable<ObjectId>) {
    super(sampleDTO);
  }
}
