import { ObjectId } from "bson";
import { IUserCreditsDao } from "../../../src/db/dao";
import { ISubscription, IUserCredits } from "../../../src/db/model";
import { MockBaseDao } from "./MockBaseDao";

export class MockUserCreditsDao
  extends MockBaseDao<IUserCredits<ObjectId>, MockUserCreditsDao>
  implements IUserCreditsDao<ObjectId, IUserCredits<ObjectId>>
{
  constructor(
    sampleDTO: IUserCredits<ObjectId>,
    overrides: Partial<IUserCreditsDao<ObjectId, IUserCredits<ObjectId>>> = {}
  ) {
    super(sampleDTO, overrides);
  }

  async findByUserId(userId: ObjectId): Promise<ISubscription<ObjectId>[]> {
    if (this.mockFunctions.findByUserId) {
      return this.mockFunctions.findByUserId(userId);
    }
    // Provide a default implementation or throw an error if needed
    throw new Error("findByUserId not implemented in mock.");
  }
}

