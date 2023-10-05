import { ObjectId } from "bson";

import { IUserCreditsDao } from "../../../src/db/dao";
import { IUserCredits } from "../../../src/db/model";
import { MockBaseDao } from "./MockBaseDao";

export class MockUserCreditsDao
  extends MockBaseDao<IUserCredits<ObjectId>, MockUserCreditsDao>
  implements IUserCreditsDao<ObjectId, IUserCredits<ObjectId>>
{
  public findByUserId = jest.fn(async () => [this.sampleDTO]);

  constructor(
    sampleDTO: IUserCredits<ObjectId>,
  ) {
    super(sampleDTO);
  }
}
