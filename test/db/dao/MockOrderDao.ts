import { ObjectId } from "bson";

import { IOrderDao } from "../../../src/db/dao"; // Import the actual path
import { IOrder } from "../../../src/db/model"; // Import the actual path
import { MockBaseDao } from "./MockBaseDao";

export class MockOrderDao
  extends MockBaseDao<IOrder<ObjectId>, MockOrderDao>
  implements IOrderDao<ObjectId, IOrder<ObjectId>>
{
  constructor(
    sampleDTO: IOrder<ObjectId>,
    overrides: Partial<MockOrderDao> | null,
  ) {
    super(sampleDTO, overrides);
  }
}
