import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IUserCredits, IUserCreditsDao } from "@user-credits/core";

import { MockBaseDao } from "./MockBaseDao";

export class MockUserCreditsDao
  extends MockBaseDao<IUserCredits<ObjectId>>
  implements IUserCreditsDao<ObjectId, IUserCredits<ObjectId>>
{
  public findByUserId = jest.fn(async () => this.sampleDTO);

  constructor(sampleDTO: IUserCredits<ObjectId>) {
    super(sampleDTO);
  }
}
